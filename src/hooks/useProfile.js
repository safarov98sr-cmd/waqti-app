import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth }  from '../lib/AuthContext'

const LS_KEY = 'waqti_profile'
const lsLoad = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') } catch { return {} } }
const lsSave = (d) => localStorage.setItem(LS_KEY, JSON.stringify(d))

export function useProfile() {
  const { user } = useAuth()
  const [topics,   setTopics]   = useState([])
  const [language, setLanguage] = useState('ru')
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    const local = lsLoad()
    setTopics(local.topics ?? [])
    setLanguage(local.content_language ?? 'ru')

    if (!user || !supabase) { setLoading(false); return }

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('topics, content_language')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        // 406 / PGRST116 = row not found — create default profile
        await supabase.from('profiles').insert({
          id: user.id,
          topics: [],
          content_language: 'ru',
        })
        setTopics([])
        setLanguage('ru')
        lsSave({ topics: [], content_language: 'ru' })
      } else {
        setTopics(data.topics ?? [])
        setLanguage(data.content_language ?? 'ru')
        lsSave({ topics: data.topics ?? [], content_language: data.content_language ?? 'ru' })
      }
      setLoading(false)
    }

    loadProfile()
  }, [user])

  const save = async (newTopics, newLang) => {
    setSaving(true)
    const payload = { topics: newTopics, content_language: newLang }
    lsSave(payload)
    if (user && supabase) {
      await supabase.from('profiles').upsert(
        { id: user.id, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
    }
    setSaving(false)
  }

  return { topics, setTopics, language, setLanguage, loading, saving, save }
}

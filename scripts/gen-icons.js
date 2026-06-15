import sharp from 'sharp'
import path  from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0A1628"/>
  <circle cx="226" cy="256" r="148" fill="white"/>
  <circle cx="298" cy="202" r="132" fill="#0A1628"/>
  <circle cx="380" cy="162" r="20" fill="white" opacity="0.9"/>
  <circle cx="415" cy="208" r="11" fill="white" opacity="0.6"/>
  <circle cx="394" cy="252" r="7" fill="white" opacity="0.4"/>
</svg>`

const buf = Buffer.from(svg)
const out = path.join(__dirname, '..', 'public')

Promise.all([
  sharp(buf).resize(192, 192).png().toFile(path.join(out, 'icon-192.png')),
  sharp(buf).resize(512, 512).png().toFile(path.join(out, 'icon-512.png')),
]).then(() => console.log('Done: icon-192.png, icon-512.png'))
  .catch(e => { console.error(e); process.exit(1) })

export const readFile = file =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve({ file, url: reader.result })
    reader.readAsDataURL(file)
  })

export const nextFrame = () =>
  new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
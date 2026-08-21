// Only import what is actually rendered. Every `import x from './x.png'` here
// makes Vite emit that file into dist/, even if nothing consumes the export —
// so unused entries ship dead bytes to production.
import razorpay from './razorpay.png'
import amazon from './amazon.jpeg'

export {
    amazon,
    razorpay
}

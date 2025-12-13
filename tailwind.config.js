/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // إضافة دعم RTL
      textAlign: {
        'right': 'right',
        'left': 'left',
      },
      // تخصيص direction لـ RTL/LTR
      direction: {
        'rtl': 'rtl',
        'ltr': 'ltr',
      },
    },
  },
  plugins: [],
  // إعداد مهم لـ RTL
  future: {
    hoverOnlyWhenSupported: true,
  },
}

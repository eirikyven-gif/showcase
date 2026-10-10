module.exports = {
  content: ['./vibe/hul-lagerstyring/index.html', './vibe/hul-lagerstyring/app.js'],
  theme: {
    extend: {
      colors: {
        hulBlue: '#1d4ed8',
        hulBlueDark: '#1e3a8a',
        hulBlueSoft: '#dbeafe',
      },
    },
  },
  safelist: [
    'border-emerald-200', 'bg-emerald-100', 'text-emerald-900',
    'border-amber-200', 'bg-amber-100', 'text-amber-900',
    'border-rose-200', 'bg-rose-100', 'text-rose-900',
    'border-slate-300', 'bg-slate-100', 'text-slate-800',
  ],
};

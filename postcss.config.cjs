// const tailwindcss = require('tailwindcss');
// const autoprefixer = require('autoprefixer');

const config = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {}

    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    // tailwindcss(),
    //But others, like autoprefixer, need to run after,
    // autoprefixer
  }
};

module.exports = config;

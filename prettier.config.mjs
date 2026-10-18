/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  // Classes passed to `clsx` are sorted like those in `className`.
  tailwindFunctions: ["clsx"],
};

export default config;

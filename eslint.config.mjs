import next from "eslint-config-next";

const config = [...next, { ignores: [".next/**", "scripts/**", "tests/**"] }];

export default config;

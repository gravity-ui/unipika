import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  verbose: true,
  transform: {
    "\\.tsx?$": "babel-jest",
  },
};

export default config;

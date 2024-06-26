import type {Config} from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    verbose: false,
    transform: {
        '\\.tsx?$': 'babel-jest',
    },
};

export default config;

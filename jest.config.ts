import type {Config} from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    verbose: false,
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
    },
};

export default config;

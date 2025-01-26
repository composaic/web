module.exports = {
    modulePathIgnorePatterns: [
        '/node_modules/',
        '/lib/',
        '/dist/'
    ],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test/mocks/fileMock.js',
        '\\.(css|less|scss)$': '<rootDir>/test/mocks/styleMock.js',
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest'
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setupTests.js']
}

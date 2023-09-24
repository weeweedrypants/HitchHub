module.exports = {
    preset: 'react-native',
    setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!react-native|@react-native|@react-navigation|react-native-picker-select)',
    ],
    testEnvironment: "node",
    type: "module",
    transform: {
        "^.+\\.js$": "babel-jest",
    },
};

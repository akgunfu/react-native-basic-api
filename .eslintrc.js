module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier', 'prettier/@typescript-eslint'],
  plugins: ['prettier'],
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    'comma-dangle': 0
  }
};

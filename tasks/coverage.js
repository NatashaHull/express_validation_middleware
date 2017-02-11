const del = require('del');
const gulp = require('gulp');
const path = require('path');
const {spawn: defaultSpawn} = require('child_process');

function spawn(...args) {
  let childProcess;
  const promise = new Promise((resolve, reject) => {
    childProcess = defaultSpawn(...args).once('close', e => {
      childProcess = null;
      if (e) return reject(e);
      resolve();
    });
    ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => childProcess && childProcess.kill()));
  });
  promise.getChildProcess = () => childProcess;
  return promise;
};

gulp.task('clean-coverage', done => del(['coverage'], done));

gulp.task('coverage', ['clean-coverage'], () => {
  const binPath = path.resolve(__dirname, '..', 'node_modules', '.bin');
  const env = {...process.env, PATH: [process.env.PATH, binPath].join(':'), NODE_ENV: 'test'};
  return spawn('nyc', ['gulp', 'spec-unit'], {stdio: 'inherit', env});
});
/* eslint-disable no-console */

import git from 'git-state';

const checkRepoState = () => {
  const state = git.checkSync('.');
  let msg;
  if (state.branch !== 'master') {
    msg = 'You are not on "master" branch!';
  } else if (isNaN(state.ahead)) {
    msg = 'No "remote" set for local repository!';
  } else if (state.ahead > 0) {
    msg = 'You are ahead of remote!';
  } else if (state.dirty > 0 || state.untracked > 0) {
    msg =
      'Some dirty or untracked files in your repo ' +
      '(untracked, modified, deleted, etc.).';
  }
  if (msg) {
    console.warning(msg, '\n', state, '\n\n');
  }
};

checkRepoState();

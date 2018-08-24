'use strict';

async function getUser() {
  setTimeout(() => {
    return 123
  }, 1000);
}

console.log('piu');

const res = await getUser()

console.log(res);

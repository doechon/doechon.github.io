var ghpages = require('gh-pages')

ghpages.publish(
  'public', // path to public directory
  {
    branch: 'gh-pages',
    repo: 'https://github.com/doechon/doechon.github.io', // Update to point to your repository
    user: {
      name: 'Ivan', // update to use your name
      email: 'i.chebykin@innopolis.university', // Update to use your email
    },
  },
  () => {
    console.log('Deploy Complete!')
  }
)

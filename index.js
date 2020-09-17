const axios = require('axios')
const he = require('he')

const fetchVideoTags = async videoId => {
  const content = await axios.get(`https://youtube.com/watch?v=${videoId}`)

  try {
    return parseVideoMetadata(content)
  } catch(error) {
    return error
  }
}

const fetchChannelVideoIdList = async channelUrl => {
  const res = await axios.get(channelUrl)
    try {
      const videoIds = parseVideoIdList(res)
      return Promise.all(Array.from(videoIds).map(async ids => await fetchVideoTags(ids)))
    } catch(error) {
      return error
    }
}

const parseVideoMetadata = ({data}) => {
  const channelOwner = data.match(/"ownerChannelName":\"(.*?)\"/)[0].slice(19).replace(/\"/g, '')
  const videoTitle = data.match(/\<title\>(.*?)\<\/title\>/)[0].slice(7, -18).replace(/\"/g, '')

  let keywords = JSON.stringify([])
  const keywordsRegexMatch = data.match(/keywords\":\[(.*?)\]/)

  if (keywordsRegexMatch){
    keywords = keywordsRegexMatch[0].slice(10)
  }
  
  return {
    title: he.decode(videoTitle),
    tags: JSON.parse(keywords),
    owner: he.decode(channelOwner)
  }
}

const parseVideoIdList = ({data}) => {
  return new Set(data.match(/videoIds\":\[(.*?)\]/g).map(el => el.slice(12, -2)))
}

fetchChannelVideoIdList('https://www.youtube.com/channel/UC0fGGprihDIlQ3ykWvcb9hg/videos').then(console.log)
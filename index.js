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
  const videoDetails = data.match(/"videoDetails":(.*?)\"isPrivate\"/)[0].slice(0, -12)
  const videoId = videoDetails.match(/videoId":"(.*?)"/)[1]
  const videoTitle = videoDetails.match(/"title":"(.*?)"/)[1]
  const keywords = videoDetails.match(/"keywords":\[(.*?)\]/)[1]
  const channelId = videoDetails.match(/"channelId":"(.*?)"/)[1]
  const channelOwner = videoDetails.match(/"author":"(.*?)"/)[1]
  
  return {
    channelId,
    owner: he.decode(channelOwner),
    tags: keywords.split(','),
    title: he.decode(videoTitle),
    videoId,
  }
}

const parseVideoIdList = ({data}) => {
  return new Set(data.match(/videoIds\":\[(.*?)\]/g).map(el => el.slice(12, -2)))
}

function runWithTime() {
  console.time("Ran in")
  fetchChannelVideoIdList('https://www.youtube.com/channel/UCpbiwmdeWqT7bE0_3qLuTdA/videos').then(data => {
    console.log(data)
    console.timeEnd("Ran in")
  })
}

runWithTime()
import { PropTypes } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, mapProps } from 'recompose'

import VideoThumb from '../presenter/video-thumb'

/** graphql query */
const query = gql`
  query($id: ID!, $productId: String!) {
    video(id: $id, productId: $productId) { title, thumbUrl, program { title } }
  }
`

/** mapDataToProps maps graphql data into VideoThumb properties */
const mapDataToProps = ({ data = {}, ...props }) => {
  if (!data.video) return {}

  return ({
    title: data.video.program.title,
    description: data.video.title,
    thumbUrl: data.video.thumbUrl,
    ...props,
  })
}

const Enhance = compose(
  graphql(query, {
    options: ({ id, productId }) => ({ variables: { id, productId } })
  }),
  mapProps(mapDataToProps)
)

/**
 * Video container receives an id and return a VideoThumb fetching data
 * Must be used inside an ApolloProvider component
 */
const Video = Enhance(VideoThumb)

Video.propTypes = {
  /** video id, used to fetch video data */
  id: PropTypes.number,
  /** product id like gloobplay or sportvplay */
  productId: PropTypes.string.isRequired
}

export default Video
export { Video }

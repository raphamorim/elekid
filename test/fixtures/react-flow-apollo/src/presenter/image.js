import React, { Component, PropTypes } from 'react'
import Style from './styles/image'

class Image extends Component {
  static propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.string,
  }

  state = {
    loaded: false,
  }

  componentWillUpdate(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.setState({ loaded: false })
    }
  }

  onLoad = () => {
    this.setState({ loaded: true })
  }

  render() {
    if (!this.props.src) { return null }

    return (
      <img
        src={this.props.src}
        alt={this.props.alt}
        style={this.props.style}
        onLoad={this.onLoad}
        {...Style.img({
          loaded: this.state.loaded,
          addClassName: this.props.className,
          addStyle: this.props.style,
        })}
      />
    )
  }
}

export default Image

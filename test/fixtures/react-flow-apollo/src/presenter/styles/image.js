import memoizeFunctions from 'memoize-functions'
import './image.css'

const Style = {
  img: ({ loaded, addClassName, addStyle = {} }) => {
    const classes = ['wrapper', addClassName]

    classes.push('visible')

    return {
      className: classes.join(' '),
      style: addStyle,
    }
  },
}

export default memoizeFunctions(Style)

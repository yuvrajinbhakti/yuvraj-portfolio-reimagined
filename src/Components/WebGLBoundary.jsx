import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Keeps a failed WebGL context from taking the page down with it.
 *
 * react-three-fiber's <Canvas> throws when it cannot get a context, and the
 * throw propagates like any other render error. With nothing to catch it, React
 * unmounts the whole tree from the root — so a visitor whose browser refuses
 * WebGL did not lose the globe, they lost the entire page: no headline, no
 * starfield, no navigation. Blank. This was reproducible: the headless browser
 * used to audit the site fails to create a context, and Home rendered nothing
 * at all.
 *
 * The globe is decoration. Everything the page is actually for sits behind it in
 * the DOM, so the correct response to a dead context is to drop the decoration
 * and keep the page.
 *
 * Has to be a class. Error boundaries have no hook equivalent — componentDidCatch
 * and getDerivedStateFromError are the only API React exposes for this.
 */
class WebGLBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Not swallowed silently: a context failure is worth seeing in the console,
    // it just should not be fatal.
    console.warn('WebGL unavailable, continuing without the hero globe:', error?.message ?? error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

WebGLBoundary.propTypes = {
  children: PropTypes.node,
  // Rendered in place of the children once a context has failed. Defaults to
  // nothing, which is the right answer for purely decorative 3D.
  fallback: PropTypes.node,
};

export default WebGLBoundary;

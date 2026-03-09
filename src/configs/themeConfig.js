// You can customize the template with the help of this file

//Template config options
const themeConfig = {
  app: {
    appName: `${process.env.REACT_APP_NAME}`,
    appLogoImage: require(`@src/assets/images/logo/logo-${process.env.REACT_APP_IMAGE_PREFIX}.svg`)
      .default,
    appLogoIcon: require(
      `@src/assets/images/logo/icon-logo-${process.env.REACT_APP_IMAGE_PREFIX}.svg`
    ).default,
  },
  layout: {
    isRTL: false,
    skin: 'light', // light, dark, bordered, semi-dark
    routerTransition: 'fadeIn', // fadeIn, fadeInLeft, zoomIn, none or check this for more transition https://animate.style/
    type: 'vertical', // vertical, horizontal
    contentWidth: 'full', // full, boxed
    menu: {
      isHidden: false,
      isCollapsed: false,
    },
    navbar: {
      type: 'floating', // static , sticky , floating, hidden
      backgroundColor: 'white', // BS color options [primary, success, etc]
    },
    footer: {
      type: 'static', // static, sticky, hidden
    },
    customizer: false,
    scrollTop: true, // Enable scroll to top button
  },
}

export default themeConfig

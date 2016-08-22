module.exports = {
    config: {
        // default font size in pixels for all tabs
        fontSize: 10,

        // font family with optional fallbacks
        fontFamily: 'Monaco',

        // terminal cursor background color (hex)
        cursorColor: '#f9fffa',

        // color of the text
        foregroundColor: '#f9fffa',

        // terminal background color
        backgroundColor: '#032b34',

        // border color (window, tabs)
        borderColor: '#032b34',

        // custom css to embed in the main window
        css: '',

        // custom css to embed in the terminal window
        termCSS: '',

        // custom padding (css format, i.e.: `top right bottom left`)
        padding: '12px 14px',

        // some color overrides. see http://bit.ly/29k1iU2 for
        // the full list
        colors: {
            black: '#6d8397',
            red: '#ff8300',
            green: '#baed00',
            yellow: '#ffe000',
            blue: '#00bef3',
            magenta: '#c6abff',
            cyan: '#79cfff',
            white: '#f9fffa',
            lightBlack: '#6d8397',
            lightRed: '#ff8300',
            lightGreen: '#baed00',
            lightYellow: '#ffe000',
            lightBlue: '#00bef3',
            lightMagenta: '#c6abff',
            lightCyan: '#79cfff',
            lightWhite: '#f9fffa'
        }
    },

    // a list of plugins to fetch and install from npm
    // format: [@org/]project[#version]
    // examples:
    //   `hyperpower`
    //   `@company/project`
    //   `project#1.0.1`
    plugins: [],

    // in development, you can create a directory under
    // `~/.hyperterm_plugins/local/` and include it here
    // to load it and avoid it being `npm install`ed
    localPlugins: []
};
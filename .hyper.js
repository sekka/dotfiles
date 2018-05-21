// Future versions of Hyper may add additional config options,
// which will not automatically be merged into this file.
// See https://hyper.is#cfg for all currently supported options.

module.exports = {
  config: {
    // choose either `'stable'` for receiving highly polished,
    // or `'canary'` for less polished but more frequent updates
    updateChannel: 'stable',

    // default font size in pixels for all tabs
    fontSize: 12,

    // Set editor line height
    lineHeight: 1.1,

    // font family with optional fallbacks
    fontFamily: 'MesloLGM-RegularForPowerline',

    // terminal cursor background color and opacity (hex, rgb, hsl, hsv, hwb or cmyk)
    cursorColor: '#fff',

    // terminal text color under BLOCK cursor
    cursorAccentColor: '#000',

    // `'BEAM'` for |, `'UNDERLINE'` for _, `'BLOCK'` for █
    cursorShape: 'BLOCK',

    // set to `true` (without backticks and without quotes) for blinking cursor
    cursorBlink: false,

    // color of the text
    foregroundColor: '#f9fffa',

    // terminal background color
    // opacity is only supported on macOS
    backgroundColor: '#032b34',

    // terminal selection color
    selectionColor: 'rgba(248,28,229,0.3)',

    // border color (window, tabs)
    borderColor: '#032b34',

    // custom CSS to embed in the main window
    css: `
      .hyper_main {border: none !important;}
      .tab_tab {border: 0;}
      .tab_textActive {border-bottom: 2px solid #009688;}
      .term_term {opacity: 0.5; transition: opacity 0.15s ease-in-out; will-change: opacity;}
      .term_active .term_term {opacity: 1;}
    `,

    // custom CSS to embed in the terminal window
    termCSS: `
    `,

    // set to `true` (without backticks and without quotes) if you're using a
    // Linux setup that doesn't show native menus
    // default: `false` on Linux, `true` on Windows, ignored on macOS
    showHamburgerMenu: '',

    // set to `false` (without backticks and without quotes) if you want to hide the minimize, maximize and close buttons
    // additionally, set to `'left'` if you want them on the left, like in Ubuntu
    // default: `true` (without backticks and without quotes) on Windows and Linux, ignored on macOS
    showWindowControls: '',

    // custom padding (CSS format, i.e.: `top right bottom left`)
    padding: '12px 14px',

    // the full list. if you're going to provide the full color palette,
    // including the 6 x 6 color cubes and the grayscale map, just provide
    // an array here instead of a color map object
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
      lightWhite: '#f9fffa',
    },

    // the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
    // if left empty, your system's login shell will be used by default
    //
    // Windows
    // - Make sure to use a full path if the binary name doesn't work
    // - Remove `--login` in shellArgs
    //
    // Bash on Windows
    // - Example: `C:\\Windows\\System32\\bash.exe`
    //
    // PowerShell on Windows
    // - Example: `C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
    shell: '',

    // for setting shell arguments (i.e. for using interactive shellArgs: `['-i']`)
    // by default `['--login']` will be used
    shellArgs: ['--login'],

    // for environment variables
    env: {},

    // set to `false` for no bell
    bell: 'SOUND',

    // if `true` (without backticks and without quotes), selected text will automatically be copied to the clipboard
    copyOnSelect: false,

    // if `true` (without backticks and without quotes), on right click selected text will be copied or pasted if no
    // selection is present (`true` by default on Windows and disables the context menu feature)
    // quickEdit: true,

    // URL to custom bell
    // bellSoundURL: 'http://example.com/bell.mp3',

    // for advanced config flags please refer to https://hyper.is/#cfg
  },

  // a list of plugins to fetch and install from npm
  // format: [@org/]project[#version]
  // examples:
  //   `hyperpower`
  //   `@company/project`
  //   `project#1.0.1`
  plugins: [
    //'hyperterm-material',
    //'hyperline',
    'hyper-tab-icons-plus',
  ],

  // in development, you can create a directory under
  // `~/.hyper_plugins/local/` and include it here
  // to load it and avoid it being `npm install`ed
  localPlugins: [],

  keymaps: {
    // Example
    // 'window:devtools': 'cmd+alt+o',
  },
};

" --------------------------------------
" plugins - init
" --------------------------------------

" plugin読み込み準備
if !filereadable(expand('~/.vim/autoload/plug.vim'))
  if !executable("curl")
    echoerr "You have to install curl or first install vim-plug yourself!"
    execute "q!"
  endif
  echo "Installing Vim-Plug..."
  echo ""
  silent !\curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  let g:not_finish_vimplug = "yes"
  autocmd VimEnter * PlugInstall
endif

" leaderの設定をSpaceに変更
let mapleader="\<Space>"


" --------------------------------------
" plugins - list
" --------------------------------------

call plug#begin(expand('~/.vim/plugged'))

" IDE
Plug 'editorconfig/editorconfig-vim'

" Space + dir -> NERDTree
Plug 'scrooloose/nerdtree'
Plug 'jistr/vim-nerdtree-tabs'

" space + sh -> vimshell↲
Plug 'Shougo/vimshell.vim'

call plug#end()


" --------------------------------------
" plugins - settings
" --------------------------------------

" NERDTree
let g:NERDTreeChDirMode=2
let g:NERDTreeIgnore=['\.rbc$', '\~$', '\.pyc$', '\.db$', '\.sqlite$', '__pycache__']
let g:NERDTreeSortOrder=['^__\.py$', '\/$', '*', '\.swp$', '\.bak$', '\~$']
let g:NERDTreeShowBookmarks=1
let g:nerdtree_tabs_focus_on_files=1
let g:NERDTreeMapOpenInTabSilent = '<RightMouse>'
let g:NERDTreeWinSize = 30
let NERDTreeShowHidden=1
set wildignore+=*/tmp/*,*.so,*.swp,*.zip,*.pyc,*.db,*.sqlite
nnoremap <Leader>dir :NERDTreeTabsToggle<CR>

" vimshell↲
"nnoremap <Leader>sh :VimShellPop<CR>
nnoremap <Leader>sh :vertical terminal<CR>
let g:vimshell_user_prompt = 'fnamemodify(getcwd(), ":~")'
let g:vimshell_prompt =  '$ '


" --------------------------------------
" settings - general
" --------------------------------------

" 文字コードを UFT-8 に設定する
set fenc=utf-8
set encoding=utf8

" ターミナルエンコード
set termencoding=utf-8

" ファイル書き込み時のエンコード
set fileencoding=utf-8
set fileencodings=utf-8

" バックアップファイルを作らない
set nobackup
set nowritebackup

" スワップファイルを作らない
set noswapfile

" 編集中のファイルが変更されたら自動で読み直す
set autoread

" バッファが編集中でもその他のファイルを開けるようにする
set hidden

" コマンドラインの履歴を10000件保存する
set history=10000

" 上下8行の視界を確保
set scrolloff=8

" 左右スクロール時の視界を確保
set sidescrolloff=16

" 左右スクロールは一文字づつ行う
set sidescroll=1

" 移動コマンドを使ったとき、行頭に移動しない
set nostartofline

" 不可視文字を表示
set list

" 不可視文字の表示記号指定
set listchars=tab:▸\ ,eol:↲,extends:❯,precedes:❮

" ビープを鳴らさない
set noerrorbells

" ビープの代わりにビジュアルベル(画面フラッシュ)を使う
set visualbell

" ビジュアルベルも無効化する
set t_vb=


" --------------------------------------
" settings - ui
" --------------------------------------

" タイトルを表示
set title

" 行番号を表示
set number
set relativenumber

" 画面最下行にルーラーを表示
set ruler

" 画面最下行にタイプ中のコマンドを表示
set showcmd

" 現在のモードを表示
set showmode

" ステータスラインを常に表示
set laststatus=2

" メッセージ表示欄を2行確保
set cmdheight=2

" 保存されていないファイルがあるときは終了前に保存確認
set confirm

" ヘルプを画面全体に表示
set helpheight=999


" --------------------------------------
" settings - cursor
" --------------------------------------

" カーソル行の背景色を変更
set cursorline

" カーソル位置のカラムの背景色を変更
" set cursorcolumn

" 行頭行末の左右移動で行をまたぐ
set whichwrap=b,s,h,l,<,>,[,]

" 全モードでマウスを有効化
set mouse=a


" --------------------------------------
" settings - edit
" --------------------------------------

" オートインデント
set autoindent
set smartindent

" タブをスペースに変換してタブを挿入
set expandtab

" コマンドラインモードでTABキーによるファイル名補完を有効にする
set wildmenu wildmode=list:longest,full

" Backspaceキーの影響範囲に制限を設けない
set backspace=indent,eol,start

" 画面上でタブ文字が占める幅
set tabstop=2

" 連続した空白に対してタブキーやバックスペースキーでカーソルが動く幅
set softtabstop=2

" 自動インデントでずれる幅
set shiftwidth=2


" --------------------------------------
" settings - search
" --------------------------------------

" 検索文字列をハイライト
set hlsearch

" インクリメンタルサーチ
set incsearch

" 検索時に大文字小文字を区別しない
set ignorecase

" 大文字と小文字が混在した言葉で検索を行った場合に限り、大文字と小文字を区別する
set smartcase

" 対応する括弧をハイライト表示
set showmatch

" 最後尾まで検索を終えたら次の検索で先頭に移る
set wrapscan

" 置換の時 g オプションをデフォルトで有効にする
set gdefault

" シンタックスハイライトを有効化
syntax enable

" ファイルタイプに応じてハイライトの挙動、色を変える
syntax on
filetype plugin on
filetype indent on


" --------------------------------------
" setting - copy 
" --------------------------------------

" OSのクリップボードを使う
set clipboard+=unnamed,autoselect
set clipboard=unnamed

" OSのクリップボードをレジスタ指定無しで Yank, Put 出来るようにする
set clipboard=unnamed,unnamedplus

" クリップボード連携を有効にした時に BackSpace (Delete) が効かなくなるので設定する
set backspace=indent,eol,start


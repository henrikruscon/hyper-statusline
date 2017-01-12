// Require
const { shell } = require('electron');
const { exec } = require('child_process');
const tildify = require('tildify');

// Config
exports.decorateConfig = (config) => {
    const dirname = process.platform === 'win32' ? __dirname.replace(/\\/gi, '/') : __dirname;
    const hyperStatusLine = Object.assign({
        footerTransparent: true,
        dirtyColor: config.colors.lightYellow,
        arrowsColor: config.colors.blue,
    }, config.hyperStatusLine);

    return Object.assign({}, config, {
        css: `
            ${config.css || ''}
            .terms_terms {
                margin-bottom: 30px;
            }
            .footer_footer {
                display: flex;
                justify-content: space-between;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 100;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
                font-size: 12px;
                height: 30px;
                padding: 0 14px 1px;
                opacity: ${hyperStatusLine.footerTransparent ? '0.5' : '1'};
                cursor: default;
                -webkit-user-select: none;
                transition: opacity 250ms ease;
            }
            .footer_footer:hover {
                opacity: 1;
            }
            .footer_footer:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
                width: 100%;
                height: 100%;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                background-color: ${config.foregroundColor || 'transparent'};
                opacity: 0.07;
            }
            .item_item {
                position: relative;
                display: flex;
                align-items: center;
                color: ${config.foregroundColor || 'white'};
                white-space: nowrap;
                background-repeat: no-repeat;
                background-position: left center;
                opacity: 0;
                pointer-events: none;
            }
            .item_active {
                opacity: 0.7;
                pointer-events: auto;
            }
            .item_active:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 14px;
                height: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: left center;
                background-color: ${config.foregroundColor || 'white'};
            }
            .item_folder {
                display: inline-block;
                text-overflow: ellipsis;
                line-height: 30px;
                padding-left: 21px;
                overflow: hidden;
            }
            .item_folder:before {
                -webkit-mask-image: url('${dirname}/icons/folder.svg');
                -webkit-mask-size: 14px 12px;
            }
            .item_branch {
                padding-left: 30px;
            }
            .item_branch:before {
                left: 14.5px;
                -webkit-mask-image: url('${dirname}/icons/git-branch.svg');
                -webkit-mask-size: 9px 12px;
            }
            .item_click:hover {
                text-decoration: underline;
                cursor: pointer;
            }
            .item_icon {
                display: none;
                width: 12px;
                height: 100%;
                margin-left: 9px;
                -webkit-mask-size: 12px 12px;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: 0 center;
            }
            .icon_active {
                display: inline-block;
            }
            .icon_dirty {
                -webkit-mask-image: url('${dirname}/icons/git-dirty.svg');
                background-color: ${hyperStatusLine.dirtyColor};
            }
            .icon_push, .icon_pull {
                -webkit-mask-image: url('${dirname}/icons/git-arrow.svg');
                background-color: ${hyperStatusLine.arrowsColor};
            }
            .icon_pull {
                transform: scaleY(-1);
                -webkit-mask-position: 0 8px;
            }
        `
    })
};

let curPid;
let curCwd;
let curBranch;
let curRemote;
let repoDirty;
let pushArrow;
let pullArrow;

// Current shell cwd
const setCwd = (pid) => {
    exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
        curCwd = cwd.trim();
        setBranch(curCwd);
    })
};

// Current git branch
const setBranch = (actionCwd) => {
    exec(`git symbolic-ref --short HEAD`, { cwd: actionCwd }, (err, branch) => {
        curBranch = branch;

        if (branch !== '') {
            setRemote(actionCwd);
            checkDirty(actionCwd);
            checkArrows(actionCwd);
        }
    })
};

// Current git remote
const setRemote = (actionCwd) => {
    exec(`git config --get remote.origin.url`, { cwd: actionCwd }, (err, remote) => {
        curRemote = /^https?:\/\//.test(remote) ? remote.trim().replace(/[A-z0-9\-]+@/, '').replace(/\.git$/, '') : '';
    })
};

// Check if repo is dirty
const checkDirty = (actionCwd) => {
    exec(`git status --porcelain --ignore-submodules -unormal`, { cwd: actionCwd }, (err, dirty) => {
        repoDirty = dirty;
    })
};

// Check git left & right arrows status
const checkArrows = (actionCwd) => {
    exec(`git rev-list --left-right --count HEAD...@'{u}' 2>/dev/null`, { cwd: actionCwd }, (err, arrows) => {
        arrows = arrows.split("\t");
        pushArrow = arrows[0] > 0 ? arrows[0] : '';
        pullArrow = arrows[1] > 0 ? arrows[1] : '';
    })
};

// Status line
exports.decorateHyper = (Hyper, { React }) => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                folder: curCwd,
                branch: curBranch,
                remote: curRemote,
                dirty: repoDirty,
                push: pushArrow,
                pull: pullArrow,
            }
            this.handleClick = this.handleClick.bind(this);
        }
        handleClick(e) {
            if (e.target.classList.contains('item_folder')) shell.openExternal('file://'+this.state.folder);
            else shell.openExternal(this.state.remote);
        }
        render() {
            const hasFolder = this.state.folder ? ' item_active item_click' : '';
            const hasBranch = this.state.branch ? ' item_active' : '';
            const hasRemote = this.state.remote ? ' item_click' : '';
            const isDirty = this.state.dirty ? ' icon_active' : '';
            const hasPush = this.state.push ? ' icon_active' : '';
            const hasPull = this.state.pull ? ' icon_active' : '';

            return (
                React.createElement(Hyper, Object.assign({}, this.props, {
                    customChildren: React.createElement('footer', { className: 'footer_footer' },
                        React.createElement('div', { title: this.state.folder, className: `item_item item_folder${hasFolder}`, onClick: this.handleClick }, this.state.folder ? tildify(String(this.state.folder)) : ''),
                        React.createElement('div', { title: this.state.remote, className: `item_item item_branch${hasBranch}${hasRemote}`, onClick: this.handleClick },
                            React.createElement('span', { className: 'item_text' }, this.state.branch),
                            React.createElement('i', { title: 'git-dirty', className: `item_icon icon_dirty${isDirty}` }),
                            React.createElement('i', { title: 'git-push', className: `item_icon icon_push${hasPush}` }),
                            React.createElement('i', { title: 'git-pull', className: `item_icon icon_pull${hasPull}` })
                        )
                    )
                }))
            )
        }
        componentDidMount() {
            this.interval = setInterval(() => {
                this.setState({
                    folder: curCwd,
                    branch: curBranch,
                    remote: curRemote,
                    dirty: repoDirty,
                    push: pushArrow,
                    pull: pullArrow,
                })
            }, 100)
        }
        componentWillUnmount() {
            clearInterval(this.interval)
        }
    };
};

// Sessions
exports.middleware = (store) => (next) => (action) => {
    const uids = store.getState().sessions.sessions;

    switch (action.type) {
        case 'SESSION_SET_XTERM_TITLE':
            curPid = uids[action.uid].pid;
            break;
        case 'SESSION_ADD':
            curPid = action.pid;
            setCwd(curPid);
            break;
        case 'SESSION_ADD_DATA':
            const { data } = action;
            if (data.charCodeAt(0) === 13) setCwd(curPid);
            break;
        case 'SESSION_SET_ACTIVE':
            curPid = uids[action.uid].pid;
            setCwd(curPid);
            break;
    }
    next(action);
};

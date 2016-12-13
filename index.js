// Require
const { shell } = require('electron');
const { exec } = require('child_process');

// Config
exports.decorateConfig = config => {
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
                opacity: 0.45;
                cursor: default;
                -webkit-user-select: none;
                transition: opacity 250ms ease;
            }
            .footer_footer:hover {
                opacity: 1;
            }
            .footer_footer::before {
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
                background-repeat: no-repeat;
                background-position: left center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                opacity: 0;
                pointer-events: none;
            }
            .item_active {
                opacity: 0.7;
                pointer-events: auto;
            }
            .item_active::before {
                content: '';
                position: absolute;
                left: 0;
                width: 14px;
                height: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: left center;
                background-color: ${config.foregroundColor || 'white'};
            }
            .item_folder {
                padding-left: 21px;
            }
            .item_folder::before {
                -webkit-mask-image: url('${__dirname}/icons/folder.svg');
                -webkit-mask-size: 14px 12px;
            }
            .item_branch {
                padding-left: 16px;
            }
            .item_branch::before {
                -webkit-mask-image: url('${__dirname}/icons/branch.svg');
                -webkit-mask-size: 9px 12px;
            }
            .item_hoverable:hover {
                text-decoration: underline;
                cursor: pointer;
            }
        `
    });
};

let curPid;
let curCwd;
let curBranch;
let curRemote;
let uids = {};

// Current shell cwd
const setCwd = (pid) =>
    exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
        cwd = cwd.trim();
        curCwd = cwd;

        store.dispatch({
            type: 'SESSION_SET_CWD',
            cwd
        });
});

// Current git branch
const setBranch = (actionCwd) => {
    exec(`git symbolic-ref --short HEAD`, { cwd: actionCwd }, (err, branch) => {
        curBranch = branch;
        if (branch !== '') {
          setRemote(actionCwd);
        }
    })
};

// Current git remote
const setRemote = (actionCwd) => {
    exec(`git config --get remote.origin.url`, { cwd: actionCwd }, (err, remote) => {
        curRemote = /^https?:\/\//.test(remote) ? remote.replace(/.git$/, '') : '';
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
                remote: curRemote
            };
            this.handleClick = this.handleClick.bind(this);
        };
        handleClick(e) {
            if (e.target.classList.contains('item_folder')) {
              shell.openExternal('file://'+this.state.folder);
            } else {
              shell.openExternal(this.state.remote);
            }
        };
        render() {
            const hasBranch = this.state.branch !== '' ? 'item_active' : '';
            const hasRemote = this.state.remote !== '' ? 'item_hoverable' : '';

            return (
                React.createElement(Hyper, Object.assign({}, this.props, {
                    customChildren: React.createElement('footer', { className: 'footer_footer' },
                        React.createElement('div', { className: 'item_item item_folder item_active item_hoverable', onClick: this.handleClick }, this.state.folder),
                        React.createElement('div', { className: `item_item item_branch ${hasBranch} ${hasRemote}`, onClick: this.handleClick },  this.state.branch)
                    )
                }))
            );
        };
        componentDidMount() {
            setInterval(() => this.setState({
                folder: curCwd,
                branch: curBranch,
                remote: curRemote
            }), 100);
        };
    };
};

// Sessions
exports.middleware = (store) => (next) => (action) => {
    switch (action.type) {
        case 'SESSION_PTY_DATA':
            if (curPid && uids[action.uid] === curPid) setCwd(curPid);
            break;
        case 'SESSION_ADD':
            uids[action.uid] = action.pid;
            curPid = action.pid;
            setCwd(curPid);
            break;
        case 'SESSION_SET_CWD':
            setBranch(curCwd);
            break;
        case 'SESSION_SET_ACTIVE':
            curPid = uids[action.uid];
            setCwd(curPid);
            break;
        case 'SESSION_PTY_EXIT':
            delete uids[action.uid];
            break;
        case 'SESSION_USER_EXIT':
            delete uids[action.uid];
            break;
    }
    next(action);
};

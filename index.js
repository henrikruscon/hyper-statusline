// Require
const { shell } = require('electron');
const { exec } = require('child_process');
const tildify = require('tildify');

// Config
exports.decorateConfig = (config) => {
    const hyperStatusLine = Object.assign({
        footerTransparent: true,
        dirtyColor: config.colors.lightYellow,
        arrowsColor: config.colors.blue,
        fontSize: 12,
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
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 100;
                font-family: ${config.uiFontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'};
                font-size: ${hyperStatusLine.fontSize}px;
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
                padding-left: 21px;
                overflow: hidden;
            }
            .item_folder:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE0IDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMywyIEw3LDIgTDcsMSBDNywwLjM0IDYuNjksMCA2LDAgTDEsMCBDMC40NSwwIDAsMC40NSAwLDEgTDAsMTEgQzAsMTEuNTUgMC40NSwxMiAxLDEyIEwxMywxMiBDMTMuNTUsMTIgMTQsMTEuNTUgMTQsMTEgTDE0LDMgQzE0LDIuNDUgMTMuNTUsMiAxMywyIEwxMywyIFogTTYsMiBMMSwyIEwxLDEgTDYsMSBMNiwyIEw2LDIgWiIvPjwvc3ZnPg==');
                -webkit-mask-size: 14px 12px;
            }
            .item_branch {
                padding-left: 30px;
            }
            .item_branch:before {
                left: 14.5px;
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5IiBoZWlnaHQ9IjEyIiB2aWV3Qm94PSIwIDAgOSAxMiI+PHBhdGggZmlsbD0iIzAwMDAwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOSwzLjQyODU3NzQ2IEM5LDIuNDc3MTQ4ODggOC4xOTksMS43MTQyOTE3NCA3LjIsMS43MTQyOTE3NCBDNi4zODY5NDE5NCwxLjcxMjI0NTc4IDUuNjc0MTI3NDksMi4yMzEzMDI2NCA1LjQ2MzA1NjAyLDIuOTc5MDk4NzEgQzUuMjUxOTg0NTQsMy43MjY4OTQ3OCA1LjU5NTQ1MzE3LDQuNTE2Mzc3NDEgNi4zLDQuOTAyODYzMTcgTDYuMyw1LjE2MDAwNjAzIEM2LjI4Miw1LjYwNTcyMDMxIDYuMDkzLDYuMDAwMDA2MDMgNS43MzMsNi4zNDI4NjMxNyBDNS4zNzMsNi42ODU3MjAzMSA0Ljk1OSw2Ljg2NTcyMDMxIDQuNDkxLDYuODgyODYzMTcgQzMuNzQ0LDYuOTAwMDA2MDMgMy4xNTksNy4wMjAwMDYwMyAyLjY5MSw3LjI2ODU3NzQ2IEwyLjY5MSwzLjE4ODU3NzQ2IEMzLjM5NTU0NjgzLDIuODAyMDkxNyAzLjczOTAxNTQ2LDIuMDEyNjA5MDcgMy41Mjc5NDM5OCwxLjI2NDgxMjk5IEMzLjMxNjg3MjUxLDAuNTE3MDE2OTIzIDIuNjA0MDU4MDYsLTAuMDAyMDM5OTM0MTUgMS43OTEsNi4wMjY4NzM4NWUtMDYgQzAuNzkyLDYuMDI2ODczODVlLTA2IDkuOTkyMDA3MjJlLTE3LDAuNzYyODYzMTcgOS45OTIwMDcyMmUtMTcsMS43MTQyOTE3NCBDMC4wMDM4NTgyMzAyNiwyLjMyMzA1MzU2IDAuMzQ2NDE5ODM1LDIuODg0MjAyMDkgMC45LDMuMTg4NTc3NDYgTDAuOSw4LjgxMTQzNDYgQzAuMzY5LDkuMTExNDM0NiAwLDkuNjYwMDA2MDMgMCwxMC4yODU3MjAzIEMwLDExLjIzNzE0ODkgMC44MDEsMTIuMDAwMDA2IDEuOCwxMi4wMDAwMDYgQzIuNzk5LDEyLjAwMDAwNiAzLjYsMTEuMjM3MTQ4OSAzLjYsMTAuMjg1NzIwMyBDMy42LDkuODMxNDM0NiAzLjQyLDkuNDI4NTc3NDYgMy4xMjMsOS4xMjAwMDYwMyBDMy4yMDQsOS4wNjg1Nzc0NiAzLjU1NSw4Ljc2ODU3NzQ2IDMuNjU0LDguNzE3MTQ4ODggQzMuODc5LDguNjIyODYzMTcgNC4xNTgsOC41NzE0MzQ2IDQuNSw4LjU3MTQzNDYgQzUuNDQ1LDguNTI4NTc3NDYgNi4yNTUsOC4xODU3MjAzMSA2Ljk3NSw3LjUwMDAwNjAzIEM3LjY5NSw2LjgxNDI5MTc0IDguMDU1LDUuODAyODYzMTcgOC4xLDQuOTExNDM0NiBMOC4wODIsNC45MTE0MzQ2IEM4LjYzMSw0LjYwMjg2MzE3IDksNC4wNTQyOTE3NCA5LDMuNDI4NTc3NDYgTDksMy40Mjg1Nzc0NiBaIE0xLjgsMC42ODU3MjAzMTMgQzIuMzk0LDAuNjg1NzIwMzEzIDIuODgsMS4xNTcxNDg4OCAyLjg4LDEuNzE0MjkxNzQgQzIuODgsMi4yNzE0MzQ2IDIuMzg1LDIuNzQyODYzMTcgMS44LDIuNzQyODYzMTcgQzEuMjE1LDIuNzQyODYzMTcgMC43MiwyLjI3MTQzNDYgMC43MiwxLjcxNDI5MTc0IEMwLjcyLDEuMTU3MTQ4ODggMS4yMTUsMC42ODU3MjAzMTMgMS44LDAuNjg1NzIwMzEzIEwxLjgsMC42ODU3MjAzMTMgWiBNMS44LDExLjMyMjg2MzIgQzEuMjA2LDExLjMyMjg2MzIgMC43MiwxMC44NTE0MzQ2IDAuNzIsMTAuMjk0MjkxNyBDMC43Miw5LjczNzE0ODg4IDEuMjE1LDkuMjY1NzIwMzEgMS44LDkuMjY1NzIwMzEgQzIuMzg1LDkuMjY1NzIwMzEgMi44OCw5LjczNzE0ODg4IDIuODgsMTAuMjk0MjkxNyBDMi44OCwxMC44NTE0MzQ2IDIuMzg1LDExLjMyMjg2MzIgMS44LDExLjMyMjg2MzIgTDEuOCwxMS4zMjI4NjMyIFogTTcuMiw0LjQ2NTcyMDMxIEM2LjYwNiw0LjQ2NTcyMDMxIDYuMTIsMy45OTQyOTE3NCA2LjEyLDMuNDM3MTQ4ODggQzYuMTIsMi44ODAwMDYwMyA2LjYxNSwyLjQwODU3NzQ2IDcuMiwyLjQwODU3NzQ2IEM3Ljc4NSwyLjQwODU3NzQ2IDguMjgsMi44ODAwMDYwMyA4LjI4LDMuNDM3MTQ4ODggQzguMjgsMy45OTQyOTE3NCA3Ljc4NSw0LjQ2NTcyMDMxIDcuMiw0LjQ2NTcyMDMxIEw3LjIsNC40NjU3MjAzMSBaIi8+PC9zdmc+');
                -webkit-mask-size: 9px 12px;
            }
            .item_click:hover {
                text-decoration: underline;
                cursor: pointer;
            }
            .item_folder, .item_text {
                line-height: 29px;
            }
            .item_text {
                height: 100%;
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
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS4xNDI4NTcxLDAgTDAuODU3MTQyODU3LDAgQzAuMzg1NzE0Mjg2LDAgMCwwLjM4NTcxNDI4NiAwLDAuODU3MTQyODU3IEwwLDExLjE0Mjg1NzEgQzAsMTEuNjE0Mjg1NyAwLjM4NTcxNDI4NiwxMiAwLjg1NzE0Mjg1NywxMiBMMTEuMTQyODU3MSwxMiBDMTEuNjE0Mjg1NywxMiAxMiwxMS42MTQyODU3IDEyLDExLjE0Mjg1NzEgTDEyLDAuODU3MTQyODU3IEMxMiwwLjM4NTcxNDI4NiAxMS42MTQyODU3LDAgMTEuMTQyODU3MSwwIEwxMS4xNDI4NTcxLDAgWiBNMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwxMS4xNDI4NTcxLDExLjE0Mjg1NzEgWiBNMy40Mjg1NzE0Myw2IEMzLjQyODU3MTQzLDQuNTc3MTQyODYgNC41NzcxNDI4NiwzLjQyODU3MTQzIDYsMy40Mjg1NzE0MyBDNy40MjI4NTcxNCwzLjQyODU3MTQzIDguNTcxNDI4NTcsNC41NzcxNDI4NiA4LjU3MTQyODU3LDYgQzguNTcxNDI4NTcsNy40MjI4NTcxNCA3LjQyMjg1NzE0LDguNTcxNDI4NTcgNiw4LjU3MTQyODU3IEM0LjU3NzE0Mjg2LDguNTcxNDI4NTcgMy40Mjg1NzE0Myw3LjQyMjg1NzE0IDMuNDI4NTcxNDMsNiBMMy40Mjg1NzE0Myw2IFoiLz48L3N2Zz4=');
                background-color: ${hyperStatusLine.dirtyColor};
            }
            .icon_push, .icon_pull {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjE0Mjg1NzE0LDYuODU3MTQyODYgTDIuNTcxNDI4NTcsNi44NTcxNDI4NiBMMi41NzE0Mjg1Nyw1LjE0Mjg1NzE0IEw1LjE0Mjg1NzE0LDUuMTQyODU3MTQgTDUuMTQyODU3MTQsMi41NzE0Mjg1NyBMOS40Mjg1NzE0Myw2IEw1LjE0Mjg1NzE0LDkuNDI4NTcxNDMgTDUuMTQyODU3MTQsNi44NTcxNDI4NiBMNS4xNDI4NTcxNCw2Ljg1NzE0Mjg2IFogTTEyLDAuODU3MTQyODU3IEwxMiwxMS4xNDI4NTcxIEMxMiwxMS42MTQyODU3IDExLjYxNDI4NTcsMTIgMTEuMTQyODU3MSwxMiBMMC44NTcxNDI4NTcsMTIgQzAuMzg1NzE0Mjg2LDEyIDAsMTEuNjE0Mjg1NyAwLDExLjE0Mjg1NzEgTDAsMC44NTcxNDI4NTcgQzAsMC4zODU3MTQyODYgMC4zODU3MTQyODYsMCAwLjg1NzE0Mjg1NywwIEwxMS4xNDI4NTcxLDAgQzExLjYxNDI4NTcsMCAxMiwwLjM4NTcxNDI4NiAxMiwwLjg1NzE0Mjg1NyBMMTIsMC44NTcxNDI4NTcgWiBNMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMC44NTcxNDI4NTcsMC44NTcxNDI4NTcgTDAuODU3MTQyODU3LDExLjE0Mjg1NzEgTDExLjE0Mjg1NzEsMTEuMTQyODU3MSBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBaIiB0cmFuc2Zvcm09Im1hdHJpeCgwIC0xIC0xIDAgMTIgMTIpIi8+PC9zdmc+');
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
    exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
        curCwd = cwd.trim();
        setBranch(curCwd);
    })
};

// Current git branch
const setBranch = (actionCwd) => {
    exec(`git symbolic-ref --short HEAD || git rev-parse --short HEAD`, { cwd: actionCwd }, (err, branch) => {
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
        curRemote = remote.trim().replace(/^git@(.*?):/, 'https://$1/').replace(/[A-z0-9\-]+@/, '').replace(/\.git$/, '');
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
        arrows = arrows.split('\t');
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
            const enterKey = data.indexOf('\n') > 0;

            if (enterKey) setCwd(curPid);
            break;
        case 'SESSION_SET_ACTIVE':
            curPid = uids[action.uid].pid;
            setCwd(curPid);
            break;
    }
    next(action);
};

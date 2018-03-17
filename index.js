const { shell } = require('electron');
const { exec } = require('child_process');
const color = require('color');
const afterAll = require('after-all-results');
const tildify = require('tildify');

exports.decorateConfig = (config) => {
    const colorForeground = color(config.foregroundColor || '#fff');
    const colorBackground = color(config.backgroundColor || '#000');
    const colors = {
        foreground: colorForeground.string(),
        background: colorBackground.lighten(0.3).string()
    };

    const configColors = Object.assign({
        black: '#000000',
        red: '#ff0000',
        green: '#33ff00',
        yellow: '#ffff00',
        blue: '#0066ff',
        magenta: '#cc00ff',
        cyan: '#00ffff',
        white: '#d0d0d0',
        lightBlack: '#808080',
        lightRed: '#ff0000',
        lightGreen: '#33ff00',
        lightYellow: '#ffff00',
        lightBlue: '#0066ff',
        lightMagenta: '#cc00ff',
        lightCyan: '#00ffff',
        lightWhite: '#ffffff'
    }, config.colors);

    const hyperStatusLine = Object.assign({
        footerTransparent: true,
        dirtyColor: configColors.lightYellow,
        aheadColor: configColors.blue
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
                font-size: 12px;
                height: 30px;
                background-color: ${colors.background};
                opacity: ${hyperStatusLine.footerTransparent ? '0.5' : '1'};
                cursor: default;
                -webkit-user-select: none;
                transition: opacity 250ms ease;
            }
            .footer_footer:hover {
                opacity: 1;
            }
            .footer_footer .footer_group {
                display: flex;
                color: ${colors.foreground};
                white-space: nowrap;
                margin: 0 14px;
            }
            .footer_footer .group_overflow {
                overflow: hidden;
            }
            .footer_footer .component_component {
                display: flex;
            }
            .footer_footer .component_item {
                position: relative;
                line-height: 30px;
                margin-left: 9px;
            }
            .footer_footer .component_item:first-of-type {
                margin-left: 0;
            }
            .footer_footer .item_clickable:hover {
                text-decoration: underline;
                cursor: pointer;
            }
            .footer_footer .item_icon:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 14px;
                height: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: 0 center;
                background-color: ${colors.foreground};
            }
            .footer_footer .item_number {
                font-size: 10.5px;
                font-weight: 500;
            }
            .footer_footer .item_cwd {
                padding-left: 21px;
            }
            .footer_footer .item_cwd:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE0IDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMywyIEw3LDIgTDcsMSBDNywwLjM0IDYuNjksMCA2LDAgTDEsMCBDMC40NSwwIDAsMC40NSAwLDEgTDAsMTEgQzAsMTEuNTUgMC40NSwxMiAxLDEyIEwxMywxMiBDMTMuNTUsMTIgMTQsMTEuNTUgMTQsMTEgTDE0LDMgQzE0LDIuNDUgMTMuNTUsMiAxMywyIEwxMywyIFogTTYsMiBMMSwyIEwxLDEgTDYsMSBMNiwyIEw2LDIgWiIvPjwvc3ZnPg==');
                -webkit-mask-size: 14px 12px;
            }
            .footer_footer .item_branch {
                padding-left: 16px;
            }
            .footer_footer .item_branch:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5IiBoZWlnaHQ9IjEyIiB2aWV3Qm94PSIwIDAgOSAxMiI+PHBhdGggZmlsbD0iIzAwMDAwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOSwzLjQyODU3NzQ2IEM5LDIuNDc3MTQ4ODggOC4xOTksMS43MTQyOTE3NCA3LjIsMS43MTQyOTE3NCBDNi4zODY5NDE5NCwxLjcxMjI0NTc4IDUuNjc0MTI3NDksMi4yMzEzMDI2NCA1LjQ2MzA1NjAyLDIuOTc5MDk4NzEgQzUuMjUxOTg0NTQsMy43MjY4OTQ3OCA1LjU5NTQ1MzE3LDQuNTE2Mzc3NDEgNi4zLDQuOTAyODYzMTcgTDYuMyw1LjE2MDAwNjAzIEM2LjI4Miw1LjYwNTcyMDMxIDYuMDkzLDYuMDAwMDA2MDMgNS43MzMsNi4zNDI4NjMxNyBDNS4zNzMsNi42ODU3MjAzMSA0Ljk1OSw2Ljg2NTcyMDMxIDQuNDkxLDYuODgyODYzMTcgQzMuNzQ0LDYuOTAwMDA2MDMgMy4xNTksNy4wMjAwMDYwMyAyLjY5MSw3LjI2ODU3NzQ2IEwyLjY5MSwzLjE4ODU3NzQ2IEMzLjM5NTU0NjgzLDIuODAyMDkxNyAzLjczOTAxNTQ2LDIuMDEyNjA5MDcgMy41Mjc5NDM5OCwxLjI2NDgxMjk5IEMzLjMxNjg3MjUxLDAuNTE3MDE2OTIzIDIuNjA0MDU4MDYsLTAuMDAyMDM5OTM0MTUgMS43OTEsNi4wMjY4NzM4NWUtMDYgQzAuNzkyLDYuMDI2ODczODVlLTA2IDkuOTkyMDA3MjJlLTE3LDAuNzYyODYzMTcgOS45OTIwMDcyMmUtMTcsMS43MTQyOTE3NCBDMC4wMDM4NTgyMzAyNiwyLjMyMzA1MzU2IDAuMzQ2NDE5ODM1LDIuODg0MjAyMDkgMC45LDMuMTg4NTc3NDYgTDAuOSw4LjgxMTQzNDYgQzAuMzY5LDkuMTExNDM0NiAwLDkuNjYwMDA2MDMgMCwxMC4yODU3MjAzIEMwLDExLjIzNzE0ODkgMC44MDEsMTIuMDAwMDA2IDEuOCwxMi4wMDAwMDYgQzIuNzk5LDEyLjAwMDAwNiAzLjYsMTEuMjM3MTQ4OSAzLjYsMTAuMjg1NzIwMyBDMy42LDkuODMxNDM0NiAzLjQyLDkuNDI4NTc3NDYgMy4xMjMsOS4xMjAwMDYwMyBDMy4yMDQsOS4wNjg1Nzc0NiAzLjU1NSw4Ljc2ODU3NzQ2IDMuNjU0LDguNzE3MTQ4ODggQzMuODc5LDguNjIyODYzMTcgNC4xNTgsOC41NzE0MzQ2IDQuNSw4LjU3MTQzNDYgQzUuNDQ1LDguNTI4NTc3NDYgNi4yNTUsOC4xODU3MjAzMSA2Ljk3NSw3LjUwMDAwNjAzIEM3LjY5NSw2LjgxNDI5MTc0IDguMDU1LDUuODAyODYzMTcgOC4xLDQuOTExNDM0NiBMOC4wODIsNC45MTE0MzQ2IEM4LjYzMSw0LjYwMjg2MzE3IDksNC4wNTQyOTE3NCA5LDMuNDI4NTc3NDYgTDksMy40Mjg1Nzc0NiBaIE0xLjgsMC42ODU3MjAzMTMgQzIuMzk0LDAuNjg1NzIwMzEzIDIuODgsMS4xNTcxNDg4OCAyLjg4LDEuNzE0MjkxNzQgQzIuODgsMi4yNzE0MzQ2IDIuMzg1LDIuNzQyODYzMTcgMS44LDIuNzQyODYzMTcgQzEuMjE1LDIuNzQyODYzMTcgMC43MiwyLjI3MTQzNDYgMC43MiwxLjcxNDI5MTc0IEMwLjcyLDEuMTU3MTQ4ODggMS4yMTUsMC42ODU3MjAzMTMgMS44LDAuNjg1NzIwMzEzIEwxLjgsMC42ODU3MjAzMTMgWiBNMS44LDExLjMyMjg2MzIgQzEuMjA2LDExLjMyMjg2MzIgMC43MiwxMC44NTE0MzQ2IDAuNzIsMTAuMjk0MjkxNyBDMC43Miw5LjczNzE0ODg4IDEuMjE1LDkuMjY1NzIwMzEgMS44LDkuMjY1NzIwMzEgQzIuMzg1LDkuMjY1NzIwMzEgMi44OCw5LjczNzE0ODg4IDIuODgsMTAuMjk0MjkxNyBDMi44OCwxMC44NTE0MzQ2IDIuMzg1LDExLjMyMjg2MzIgMS44LDExLjMyMjg2MzIgTDEuOCwxMS4zMjI4NjMyIFogTTcuMiw0LjQ2NTcyMDMxIEM2LjYwNiw0LjQ2NTcyMDMxIDYuMTIsMy45OTQyOTE3NCA2LjEyLDMuNDM3MTQ4ODggQzYuMTIsMi44ODAwMDYwMyA2LjYxNSwyLjQwODU3NzQ2IDcuMiwyLjQwODU3NzQ2IEM3Ljc4NSwyLjQwODU3NzQ2IDguMjgsMi44ODAwMDYwMyA4LjI4LDMuNDM3MTQ4ODggQzguMjgsMy45OTQyOTE3NCA3Ljc4NSw0LjQ2NTcyMDMxIDcuMiw0LjQ2NTcyMDMxIEw3LjIsNC40NjU3MjAzMSBaIi8+PC9zdmc+');
                -webkit-mask-size: 9px 12px;
            }
            .footer_footer .item_dirty {
                color: ${hyperStatusLine.dirtyColor};
                padding-left: 16px;
            }
            .footer_footer .item_dirty:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS4xNDI4NTcxLDAgTDAuODU3MTQyODU3LDAgQzAuMzg1NzE0Mjg2LDAgMCwwLjM4NTcxNDI4NiAwLDAuODU3MTQyODU3IEwwLDExLjE0Mjg1NzEgQzAsMTEuNjE0Mjg1NyAwLjM4NTcxNDI4NiwxMiAwLjg1NzE0Mjg1NywxMiBMMTEuMTQyODU3MSwxMiBDMTEuNjE0Mjg1NywxMiAxMiwxMS42MTQyODU3IDEyLDExLjE0Mjg1NzEgTDEyLDAuODU3MTQyODU3IEMxMiwwLjM4NTcxNDI4NiAxMS42MTQyODU3LDAgMTEuMTQyODU3MSwwIEwxMS4xNDI4NTcxLDAgWiBNMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwxMS4xNDI4NTcxLDExLjE0Mjg1NzEgWiBNMy40Mjg1NzE0Myw2IEMzLjQyODU3MTQzLDQuNTc3MTQyODYgNC41NzcxNDI4NiwzLjQyODU3MTQzIDYsMy40Mjg1NzE0MyBDNy40MjI4NTcxNCwzLjQyODU3MTQzIDguNTcxNDI4NTcsNC41NzcxNDI4NiA4LjU3MTQyODU3LDYgQzguNTcxNDI4NTcsNy40MjI4NTcxNCA3LjQyMjg1NzE0LDguNTcxNDI4NTcgNiw4LjU3MTQyODU3IEM0LjU3NzE0Mjg2LDguNTcxNDI4NTcgMy40Mjg1NzE0Myw3LjQyMjg1NzE0IDMuNDI4NTcxNDMsNiBMMy40Mjg1NzE0Myw2IFoiLz48L3N2Zz4=');
                -webkit-mask-size: 12px 12px;
                background-color: ${hyperStatusLine.dirtyColor};
            }
            .footer_footer .item_ahead {
                color: ${hyperStatusLine.aheadColor};
                padding-left: 16px;
            }
            .footer_footer .item_ahead:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjE0Mjg1NzE0LDYuODU3MTQyODYgTDIuNTcxNDI4NTcsNi44NTcxNDI4NiBMMi41NzE0Mjg1Nyw1LjE0Mjg1NzE0IEw1LjE0Mjg1NzE0LDUuMTQyODU3MTQgTDUuMTQyODU3MTQsMi41NzE0Mjg1NyBMOS40Mjg1NzE0Myw2IEw1LjE0Mjg1NzE0LDkuNDI4NTcxNDMgTDUuMTQyODU3MTQsNi44NTcxNDI4NiBMNS4xNDI4NTcxNCw2Ljg1NzE0Mjg2IFogTTEyLDAuODU3MTQyODU3IEwxMiwxMS4xNDI4NTcxIEMxMiwxMS42MTQyODU3IDExLjYxNDI4NTcsMTIgMTEuMTQyODU3MSwxMiBMMC44NTcxNDI4NTcsMTIgQzAuMzg1NzE0Mjg2LDEyIDAsMTEuNjE0Mjg1NyAwLDExLjE0Mjg1NzEgTDAsMC44NTcxNDI4NTcgQzAsMC4zODU3MTQyODYgMC4zODU3MTQyODYsMCAwLjg1NzE0Mjg1NywwIEwxMS4xNDI4NTcxLDAgQzExLjYxNDI4NTcsMCAxMiwwLjM4NTcxNDI4NiAxMiwwLjg1NzE0Mjg1NyBMMTIsMC44NTcxNDI4NTcgWiBNMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMC44NTcxNDI4NTcsMC44NTcxNDI4NTcgTDAuODU3MTQyODU3LDExLjE0Mjg1NzEgTDExLjE0Mjg1NzEsMTEuMTQyODU3MSBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBaIiB0cmFuc2Zvcm09Im1hdHJpeCgwIC0xIC0xIDAgMTIgMTIpIi8+PC9zdmc+');
                -webkit-mask-size: 12px 12px;
               background-color: ${hyperStatusLine.aheadColor};
            }
            .notifications_view {
                bottom: 50px;
            }
        `
    });
};

let pid;
let cwd;
let git = {
    branch: '',
    remote: '',
    dirty: 0,
    ahead: 0
}

const setCwd = (pid, action) => {
    if (process.platform == 'win32') {
        let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
        if (action && action.data) {
            let path = directoryRegex.exec(action.data);
            if(path){
                cwd = path[0];
                setGit(cwd);
            }
        }
    } else {
        exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (err, stdout) => {
            cwd = stdout.trim();
            setGit(cwd);
        });
    }
    
};

const isGit = (dir, cb) => {
    exec(`git rev-parse --is-inside-work-tree`, { cwd: dir }, (err) => {
        cb(!err);
    });
}

const gitBranch = (repo, cb) => {
    exec(`git symbolic-ref --short HEAD || git rev-parse --short HEAD`, { cwd: repo }, (err, stdout) => {
        if (err) {
            return cb(err);
        }

        cb(null, stdout.trim());
    });
}

const gitRemote = (repo, cb) => {
    exec(`git ls-remote --get-url`, { cwd: repo }, (err, stdout) => {
        cb(null, stdout.trim().replace(/^git@(.*?):/, 'https://$1/').replace(/[A-z0-9\-]+@/, '').replace(/\.git$/, ''));
    });
}

const gitDirty = (repo, cb) => {
    exec(`git status --porcelain --ignore-submodules -uno`, { cwd: repo }, (err, stdout) => {
        if (err) {
            return cb(err);
        }

        cb(null, !stdout ? 0 : parseInt(stdout.trim().split('\n').length, 10));
    });
}

const gitAhead = (repo, cb) => {
    exec(`git rev-list --left-only --count HEAD...@'{u}' 2>/dev/null`, { cwd: repo }, (err, stdout) => {
        cb(null, parseInt(stdout, 10));
    });
}

const gitCheck = (repo, cb) => {
    const next = afterAll((err, results) => {
        if (err) {
            return cb(err);
        }

        const branch = results[0];
        const remote = results[1];
        const dirty = results[2];
        const ahead = results[3];

        cb(null, {
            branch: branch,
            remote: remote,
            dirty: dirty,
            ahead: ahead
        });
    });

    gitBranch(repo, next());
    gitRemote(repo, next());
    gitDirty(repo, next());
    gitAhead(repo, next());
}

const setGit = (repo) => {
    isGit(repo, (exists) => {
        if (!exists) {
            git = {
                branch: '',
                remote: '',
                dirty: 0,
                ahead: 0
            }

            return;
        }

        gitCheck(repo, (err, result) => {
            if (err) {
                throw err;
            }

            git = {
                branch: result.branch,
                remote: result.remote,
                dirty: result.dirty,
                ahead: result.ahead
            }
        })
    });
}

exports.decorateHyper = (Hyper, { React }) => {
    return class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                cwd: '',
                branch: '',
                remote: '',
                dirty: 0,
                ahead: 0
            }

            this.handleCwdClick = this.handleCwdClick.bind(this);
            this.handleBranchClick = this.handleBranchClick.bind(this);
        }

        handleCwdClick(event) {
            shell.openExternal('file://'+this.state.cwd);
        }

        handleBranchClick(event) {
            shell.openExternal(this.state.remote);
        }

        render() {
            const { customChildren } = this.props
            const existingChildren = customChildren ? customChildren instanceof Array ? customChildren : [customChildren] : [];

            return (
                React.createElement(Hyper, Object.assign({}, this.props, {
                    customInnerChildren: existingChildren.concat(React.createElement('footer', { className: 'footer_footer' },
                        React.createElement('div', { className: 'footer_group group_overflow' },
                            React.createElement('div', { className: 'component_component component_cwd' },
                                React.createElement('div', { className: 'component_item item_icon item_cwd item_clickable', title: this.state.cwd, onClick: this.handleCwdClick, hidden: !this.state.cwd }, this.state.cwd ? tildify(String(this.state.cwd)) : '')
                            )
                        ),
                        React.createElement('div', { className: 'footer_group' },
                            React.createElement('div', { className: 'component_component component_git' },
                                React.createElement('div', { className: `component_item item_icon item_branch ${this.state.remote ? 'item_clickable' : ''}`, title: this.state.remote, onClick: this.handleBranchClick, hidden: !this.state.branch }, this.state.branch),
                                React.createElement('div', { className: 'component_item item_icon item_number item_dirty', title: `${this.state.dirty} dirty ${this.state.dirty > 1 ? 'files' : 'file'}`, hidden: !this.state.dirty }, this.state.dirty),
                                React.createElement('div', { className: 'component_item item_icon item_number item_ahead', title: `${this.state.ahead} ${this.state.ahead > 1 ? 'commits' : 'commit'} ahead`, hidden: !this.state.ahead }, this.state.ahead)
                            )
                        )
                    ))
                }))
            );
        }

        componentDidMount() {
            this.interval = setInterval(() => {
                this.setState({
                    cwd: cwd,
                    branch: git.branch,
                    remote: git.remote,
                    dirty: git.dirty,
                    ahead: git.ahead
                });
            }, 100);
        }

        componentWillUnmount() {
            clearInterval(this.interval);
        }
    };
};

exports.middleware = (store) => (next) => (action) => {
    const uids = store.getState().sessions.sessions;

    switch (action.type) {
        case 'SESSION_SET_XTERM_TITLE':
            pid = uids[action.uid].pid;
            break;

        case 'SESSION_ADD':
            pid = action.pid;
            setCwd(pid);
            break;

        case 'SESSION_ADD_DATA':
            const { data } = action;
            const enterKey = data.indexOf('\n') > 0;

            if (enterKey) {
                setCwd(pid, action);
            }
            break;

        case 'SESSION_SET_ACTIVE':
            pid = uids[action.uid].pid;
            setCwd(pid);
            break;
    }

    next(action);
};

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
            .footer_footer .item_k8s {
                padding-left: 21px;
            }
            .footer_footer .item_k8s:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBlbmFi bGUtYmFja2dyb3VuZD0ibmV3IC0xMzEuMDkxIC0yNDguNzYzIDQzMiA0MzIiIHZl cnNpb249IjEuMSIgdmlld0JveD0iLTEzMS4wOTEgLTI0OC43NjMgNDMyIDQzMiIg eG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIw MDAvc3ZnIj4KPGcgZmlsbD0iIzIzMUYyMCI+Cgk8cGF0aCBkPSJtMjk3LjU3IDEy LjQ1NmwtMzYuNjA4LTE1OS4wMWMtMS44ODYtOC4xOTgtNy42OTEtMTUuNDE1LTE1 LjMyNy0xOS4wNjNsLTE0OC4xNy03MC43NWMtNC4yNTQtMi4wMzMtOS4wMjQtMi45 ODctMTMuNzM3LTIuNzQ3LTMuNzU3IDAuMTg2LTcuNDczIDEuMTI4LTEwLjg1OSAy Ljc0N2wtMTQ4LjE1IDcwLjc4OWMtNy42MzggMy42NDctMTMuNDQ0IDEwLjg2Ni0x NS4zMyAxOS4wNmwtMzYuNTQ4IDE1OS4wMWMtMS42ODUgNy4zMDQtMC4yNjQgMTUu MjU5IDMuODQ2IDIxLjU0NSAwLjUgMC43NjkgMS4wMzYgMS41MTYgMS42MTEgMi4y MzVsMTAyLjU0IDEyNy41YzUuMjg0IDYuNTcgMTMuNjcyIDEwLjU3NSAyMi4xNDgg MTAuNTcybDE2NC40NS0wLjAzOWM4LjQ3MSA2ZS0zIDE2Ljg1OC0zLjk5MSAyMi4x NDktMTAuNTU1bDEwMi41MS0xMjcuNTJjNS4yODktNi41NzIgNy4zNjItMTUuNTc3 IDUuNDc2LTIzLjc3OXptLTEyNS41NiAxNDMuNzJsLTE3My42IDAuMDE4LTEwOC4y NS0xMzQuNiAzOC42MTItMTY3Ljg3IDE1Ni40LTc0LjcyMyAxNTYuNDIgNzQuNjg3 IDM4LjY0OCAxNjcuODYtMTA4LjIyIDEzNC42M3oiLz4KCTxwb2x5Z29uIHBvaW50 cz0iLTcxLjIyMyAtMTQ2LjI3IC0xMDkuODQgMjEuNTkyIi8+Cgk8cG9seWdvbiBw b2ludHM9Ii0xLjU4MyAxNTYuMTkgLTEwOS44NCAyMS41OTIgLTEuNTgzIDE1Ni4x OSAxNzIuMDIgMTU2LjE4IDI4MC4yNCAyMS41NTEgMTcyLjAyIDE1Ni4xOCIvPgoJ PHBvbHlnb24gcG9pbnRzPSItNzEuMjIzIC0xNDYuMjcgLTcxLjIyMyAtMTQ2LjI3 IDg1LjE3OCAtMjIxIi8+Cgk8cG9seWdvbiBwb2ludHM9Ijg1LjE3OCAtMjIxIDI0 MS41OSAtMTQ2LjMxIDI4MC4yNCAyMS41NTEgMjQxLjU5IC0xNDYuMzEiLz4KCTxw YXRoIGQ9Im01OC44NTUtNjMuNjJjMS4yOTQgMC45NDQgMi44ODQgMS40OTUgNC42 MDcgMS40OTUgNC4yMDMgMCA3LjYyOS0zLjMyMiA3LjgwNC03LjQ4NGwwLjE4OS0w LjA5NSAyLjYzNS00Ni41MTdjLTMuMTQ0IDAuMzgyLTYuMjk4IDAuOTE1LTkuNDU3 IDEuNjMxLTE3LjI3NyAzLjkyMy0zMi4yNzQgMTIuNDQtNDMuOTk0IDIzLjk2OWwz OC4xNDIgMjcuMDM5IDAuMDc0LTAuMDM4eiIvPgoJPHBvbHlnb24gcG9pbnRzPSI3 Mi4zNDYgLTE0Ljc5IDg1LjE5MiAtOC42MTUgOTguMDA0IC0xNC43NzMgMTAxLjE5 IC0yOC42MDUgOTIuMzE5IC0zOS42ODkgNzguMDUyIC0zOS42ODkgNjkuMTY0IC0y OC42MjIiLz4KCTxwYXRoIGQ9Im05OC45OS02OS43NjFjMC4wNjQgMS41OTkgMC42 MzEgMy4xODMgMS43MDUgNC41MyAyLjYyIDMuMjg2IDcuMzU5IDMuODk2IDEwLjcy MyAxLjQzOWwwLjEzMyAwLjA1NyAzNy44OTYtMjYuODY4Yy0xNC4yOTctMTQtMzIu OTU1LTIzLjEzNC01My4xMzItMjUuNjE4bDIuNjM1IDQ2LjQ0MyAwLjA0IDAuMDE3 eiIvPgoJPHBhdGggZD0ibTkyLjA3NCAyMS4zMjNjLTAuNzU2LTEuNDEyLTEuOTU1 LTIuNTg4LTMuNTA1LTMuMzMzLTEuMTg1LTAuNTcxLTIuNDMxLTAuODIzLTMuNjYt MC43NzktMi43IDAuMTAxLTUuMjYxIDEuNjA4LTYuNjExIDQuMTMxaC0wLjAzOWwt MjIuNTA5IDQwLjcwMmMxNS41NzggNS4zMDkgMzIuNzgzIDYuNDk1IDUwLjA0IDIu NTc1IDMuMDc5LTAuNjk5IDYuMDktMS41MzkgOS4wMjEtMi41MTlsLTIyLjU2OS00 MC43NzdoLTAuMTY4eiIvPgoJPHBhdGggZD0ibTg1LjE3OC0yMjFsLTE1Ni40IDc0 LjcyMy0zOC42MTIgMTY3Ljg3IDEwOC4yNSAxMzQuNiAxNzMuNi0wLjAxOCAxMDgu MjItMTM0LjYyLTM4LjY0OC0xNjcuODYtMTU2LjQyLTc0LjY4OHptMTU2LjAzIDIz MS41MmMtMS4wODEgNC43MzQtNi4xODggNy42MTItMTEuNDQ2IDYuNDgxLTAuMDM1 LTllLTMgLTAuMDkyLTAuMDEyLTAuMTMtMC4wMi0wLjA2LTAuMDEyLTAuMTEzLTAu MDQyLTAuMTcyLTAuMDU3LTAuNzM0LTAuMTU5LTEuNjUyLTAuMzE5LTIuMjkxLTAu NDkxLTMuMDM1LTAuODExLTUuMjMyLTIuMDI1LTcuOTU4LTMuMDctNS44NjktMi4x MDUtMTAuNzMtMy44NjMtMTUuNDY0LTQuNTQ4LTIuNDA0LTAuMTg5LTMuNjMgMC45 Ni00Ljk2NSAxLjgzOS0wLjY0NS0wLjEzLTIuNjQxLTAuNDgzLTMuNzktMC42NjMt OC40OTcgMjYuNzAyLTI2LjU4OSA0OS44MjQtNTEuMTIxIDY0LjMwOCAwLjQyNCAx LjAyNCAxLjE0MyAzLjE5NyAxLjQ3NyAzLjU4Mi0wLjU1OSAxLjQ5NS0xLjQgMi45 MjktMC42ODEgNS4yMjkgMS43MiA0LjQ2NCA0LjUwNiA4LjgyOCA3Ljg2MyAxNC4w ODEgMS42MjUgMi40MjUgMy4yODkgNC4yOSA0Ljc1NCA3LjA2NyAwLjM1MiAwLjY2 MyAwLjgxOCAxLjY4NSAxLjE1OCAyLjM4NiAyLjI4IDQuODc2IDAuNjA3IDEwLjQ5 My0zLjc3MiAxMi42LTQuNDExIDIuMTI2LTkuODk3LTAuMTE4LTEyLjI2LTUuMDIx LTAuMzM3LTAuNjkzLTAuODExLTEuNjE2LTEuMDk4LTIuMjc0LTEuMjU1LTIuODc3 LTEuNjkzLTUuMzQzLTIuNTc1LTguMTI2LTIuMDE0LTUuOS0zLjY2NS0xMC43ODYt Ni4wODUtMTQuOTEzLTEuMzUtMS45OTktMy4wMDctMi4yNTMtNC41MjYtMi43NDct MC4yODEtMC40ODYtMS4zMzItMi40MS0xLjg5NS0zLjQxMS00LjkgMS44NS05Ljk2 NiAzLjM5My0xNS4yMTQgNC41ODYtMjMuMDEgNS4yMjItNDYuMDQ0IDMuMTAzLTY2 LjYyMy00Ljc5NmwtMi4wMDcgMy42MzhjLTEuNDk1IDAuNC0yLjkzNyAwLjgwOS0z LjgyMiAxLjg2Mi0zLjIzIDMuODUzLTQuNTE4IDEwLjAzNy02Ljg2NiAxNS45MzIt MC44ODIgMi43ODMtMS4zIDUuMjQ5LTIuNTU4IDguMTI3LTAuMjg0IDAuNjUxLTAu NzYxIDEuNTYzLTEuMDk4IDIuMjU2LTNlLTMgNmUtMyAzZS0zIDAuMDE1IDAgMC4w MTgtM2UtMyA4ZS0zIC0wLjAxNSAwLjAxMS0wLjAxNyAwLjAyLTIuMzY4IDQuODg1 LTcuODM3IDcuMTIzLTEyLjI0MyA1LjAwMS00LjM3OS0yLjEwNS02LjA0OC03Ljcy Mi0zLjc2OC0xMi42IDAuMzM3LTAuNzAyIDAuNzg0LTEuNzIzIDEuMTM3LTIuMzg3 IDEuNDY1LTIuNzc3IDMuMTI5LTQuNjYgNC43NTQtNy4wODcgMy4zNTgtNS4yNTIg Ni4zMDYtOS45NjMgOC4wMjYtMTQuNDI1IDAuNDMyLTEuNDgzLTAuMjA4LTMuNTE0 LTAuNzg4LTUuMDE1bDEuNjExLTMuODY2Yy0yMy42MDUtMTMuOTg4LTQyLjI0Ni0z Ni4yNzktNTEuMTQyLTYzLjg1N2wtMy44NjMgMC42NjNjLTEuMDM3LTAuNTc4LTMu MTIxLTEuOTU0LTUuMDk4LTEuOC00LjczNCAwLjY4Ny05LjU5NSAyLjQ0NS0xNS40 NiA0LjU0OC0yLjczIDEuMDQ1LTQuOTI3IDIuMjM4LTcuOTU4IDMuMDUyLTAuNjQz IDAuMTcyLTEuNTYxIDAuMzQ5LTIuMjk1IDAuNTEyLTAuMDU5IDAuMDE0LTAuMTA5 IDAuMDQxLTAuMTY4IDAuMDU2LTAuMDQyIDllLTMgLTAuMDk1IDllLTMgLTAuMTMz IDAuMDE3LTUuMjU4IDEuMTM1LTEwLjM2NS0xLjc0My0xMS40NDYtNi40OC0xLjA4 MS00LjczMiAyLjI3Ny05LjUzNiA3LjUwNi0xMC44IDAuMDM4LTllLTMgMC4wOTIt MC4wMjcgMC4xMy0wLjAzNiAwLjAyNy02ZS0zIDAuMDUxLTAuMDE1IDAuMDc3LTAu MDIxIDAuNzQzLTAuMTc0IDEuNjktMC40MiAyLjM2OC0wLjU0NyAzLjA4NS0wLjU4 NyA1LjU5Ni0wLjQ0MSA4LjUwOS0wLjY4NCA2LjE5OS0wLjY0OCAxMS4zMzMtMS4x NzggMTUuODk1LTIuNjE0IDEuNDQ4LTAuNTkyIDIuODMxLTIuNTgxIDMuODExLTMu ODQ2bDMuNzEyLTEuMDgxYy00LjE2My0yOC44MTggMi44ODEtNTcuMTAyIDE4LjA5 NS03OS45OTlsLTIuODQyLTIuNTM3Yy0wLjE4LTEuMTA3LTAuNDIxLTMuNjY1LTEu NzgzLTUuMTE2LTMuNDg3LTMuMjc0LTcuODg0LTUuOTkyLTEzLjE4Ni05LjI2Ny0y LjUxNi0xLjQ4LTQuODI2LTIuNDM3LTcuMzUxLTQuMzAyLTAuNTM5LTAuMzk2LTEu MjU1LTEuMDAzLTEuODM5LTEuNDc3LTAuMDQ1LTAuMDMzLTAuMDg5LTAuMDU5LTAu MTMzLTAuMDk1LTQuMjU0LTMuMzkzLTUuMjMxLTkuMjQ2LTIuMTc5LTEzLjA3NCAx LjcxNy0yLjE1NSA0LjM0NC0zLjIyMSA3LjA2Ny0zLjEyNiAyLjEyMyAwLjA3NCA0 LjMxNyAwLjg0NyA2LjE3OSAyLjMzIDAuNjA0IDAuNDggMS40MjkgMS4xMDcgMS45 NjggMS41NzMgMi4zODQgMi4wNDkgMy44MzQgNC4wNzQgNS44MzkgNi4xOTYgNC4z NzIgNC40NDEgNy45ODggOC4xMyAxMS45NTUgMTAuOCAyLjA4NCAxLjIxNCAzLjY4 MyAwLjcyNiA1LjI2NyAwLjUxMiAwLjUwOSAwLjM3NiAyLjIyNCAxLjYwNSAzLjIw NCAyLjI3NCAxNS4wOTMtMTYuMDE0IDM0LjkxNy0yNy44NzQgNTcuOTQyLTMzLjEw MyA1LjM1LTEuMjEzIDEwLjcwOS0yLjAyMiAxNi4wMjgtMi40NjNsMC4yMTEtMy43 NTFjMS4xODEtMS4xNDMgMi41MDQtMi43ODYgMi44ODEtNC41ODYgMC4zODQtNC43 NjctMC4yNC05Ljg5Ny0wLjk4Ni0xNi4wODUtMC40MTItMi44OTMtMS4wOTYtNS4y OTQtMS4yMTQtOC40MzItMC4wMjMtMC42NDYgMC4wMTItMS41MzcgMC4wMjEtMi4y NzQtM2UtMyAtMC4wODMtMC4wMjEtMC4xNjMtMC4wMjEtMC4yNDkgMC01LjQzOSAz Ljk3LTkuODUgOC44NjctOS44NTMgNC45IDAgOC44NjggNC40MTQgOC44NzEgOS44 NTMgMmUtMyAwLjc3MiAwLjA0NCAxLjgwOSAwLjAxNyAyLjUyMi0wLjExNSAzLjEz OC0wLjgwMyA1LjUzOS0xLjIxNCA4LjQzMi0wLjc0NiA2LjE4OC0xLjM4OSAxMS4z MTgtMS4wMDQgMTYuMDg1IDAuMzUzIDIuMzg3IDEuNzQ3IDMuMzMxIDIuODk4IDQu NDM1IDAuMDI3IDAuNjQzIDAuMTMgMi43NzcgMC4yMTEgMy45NTkgMjguMTk0IDIu NTA0IDU0LjM4MSAxNS4zOTggNzMuNjEzIDM1LjU2NWwzLjM3Mi0yLjQwNmMxLjE0 MyAwLjA2OCAzLjY2MiAwLjQxNSA1LjM4My0wLjU4NyAzLjk2Ny0yLjY3IDcuNTgx LTYuMzc3IDExLjk1NS0xMC44MTggMi4wMDQtMi4xMjYgMy40NzMtNC4xNDggNS44 NTYtNi4xOTcgMC41NDEtMC40NjggMS4zNjQtMS4wOTIgMS45NjgtMS41NzIgNC4y NTQtMy4zOTYgMTAuMTczLTMuMDM1IDEzLjIyNSAwLjc5NCAzLjA1NiAzLjgzMSAy LjA3NiA5LjY4MS0yLjE3OSAxMy4wNzQtMC41OTggMC40ODItMS4zNzkgMS4xNTEt MS45NTEgMS41NzUtMi41MjUgMS44NjUtNC44NTIgMi44MTktNy4zNjggNC4yOTkt NS4zMDUgMy4yNzctOS43MDIgNS45OTItMTMuMTkgOS4yNjYtMS42NDYgMS43NjEt MS41MjIgMy40MzItMS42NjcgNS4wMjEtMC40OTEgMC40NTMtMi4yMjcgMS45OS0z LjE0NCAyLjgyNSA3LjY0MSAxMS4zNzUgMTMuMzczIDI0LjI4OSAxNi42MTQgMzgu NDA1IDMuMjE2IDEzLjk4OSAzLjcxNiAyNy45NjkgMS44NiA0MS40MDFsMy41Nzkg MS4wNDJjMC42NDYgMC45MTIgMS45NjkgMy4xMjYgMy44MjggMy44NDkgNC41NjMg MS40MzUgOS42OTkgMS45NjMgMTUuODk5IDIuNjE0IDIuOTEgMC4yNDMgNS40MjEg MC4wOTggOC41MDUgMC42ODEgMC43NCAwLjEzOSAxLjgxOCAwLjQzNiAyLjU3OSAw LjYwNyA1LjIyNSAxLjI2MyA4LjU4MiA2LjA2OCA3LjUwMiAxMC44MDJ6Ii8+Cgk8 cGF0aCBkPSJtMTYzLjM0LTczLjIyN2wtMzQuNjM2IDMwLjk5OCAwLjAxNyAwLjA5 NWMtMS4yMDggMS4wNS0yLjA5OSAyLjQ3Mi0yLjQ4MSA0LjE1LTAuOTM2IDQuMSAx LjUzMyA4LjE4NiA1LjU1MSA5LjI4NGwwLjAzOSAwLjE5IDQ0Ljg2OCAxMi45MjNj MC45NS05LjY4MSAwLjM3My0xOS42OTctMS45MzMtMjkuNzMxLTIuMzMzLTEwLjE1 NC02LjI1LTE5LjUyMS0xMS40MjUtMjcuOTA5eiIvPgoJPHBhdGggZD0ibTUzLjcz OSA0LjUxNmMtMC44MTctMy41ODUtMy45NzktNi4wMzMtNy41MDItNi4wODEtMC41 MDMtOWUtMyAtMS4wMjIgMC4wMzktMS41MzMgMC4xMzNsLTAuMDc3LTAuMDk1LTQ1 Ljc3OCA3Ljc2OWM3LjA2NCAxOS41NDYgMjAuMjcxIDM1LjQ3NyAzNi44NTQgNDYu MTE3bDE3LjczNC00Mi44Ni0wLjEzMy0wLjE2OWMwLjYzMy0xLjQ3MSAwLjgyLTMu MTM2IDAuNDM1LTQuODE0eiIvPgoJPHBhdGggZD0ibTEyNS41OS0xLjYyMWMtMC41 ODktMC4xMS0xLjE5My0wLjE2Ni0xLjgtMC4xMzMtMS4wMSAwLjA1LTIuMDIyIDAu MzA4LTIuOTkzIDAuNzc1LTMuNzkgMS44MjQtNS40MzYgNi4zMTMtMy43OSAxMC4x MzdsLTAuMDU2IDAuMDc3IDE3LjkyMyA0My4yOTZjMTcuMjc4LTExLjAwNyAzMC4y MTEtMjcuNDU3IDM2Ljk3LTQ2LjQ0M2wtNDYuMTc3LTcuODA0LTAuMDc3IDAuMDk1 eiIvPgoJPHBhdGggZD0ibTM4LjUyNC0yOC40NzFjMS41NDItMC40MjQgMi45ODIt MS4zMjYgNC4wNTYtMi42NzMgMi42Mi0zLjI4NiAyLjE1OC04LjAyOS0wLjk4Ni0x MC43NjJsMC4wMzktMC4xODktMzQuODI1LTMxLjE1Yy0xMC4zMzkgMTYuODM3LTE1 LjIzMyAzNy4wMzQtMTIuOTYyIDU3LjgwOWw0NC42NC0xMi44ODUgMC4wMzgtMC4x NXoiLz4KPC9nPgo8L3N2Zz4K');
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
let k8sContext;

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
            setK8s();
        });
    }
    
};

const setK8s = (pid, action) => {
    exec(`cat ~/.kube/config | grep "current-context:" | sed "s/current-context: //"`, (err, stdout) => {
        k8sContext = stdout.trim();
    });
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
                ahead: 0,
                k8sContext: ''
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
                            React.createElement('div', { className: 'component_component component_k8s' },
                                React.createElement('div', { className: 'component_item item_icon item_k8s', title: this.state.k8sContext, hidden: !this.state.k8sContext }, this.state.k8sContext ? this.state.k8sContext : '')
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
                    ahead: git.ahead,
                    k8sContext: k8sContext
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

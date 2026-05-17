import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./react-D1sJ83FZ.js";import{n as r,r as i,t as a}from"./jsx-runtime-Cyf6BxT7.js";import{n as o,t as s}from"./lucide-react-Cwa-Cgvw.js";import{n as c,t as l}from"./Button-PlVVoMOo.js";function u({open:e,onClose:t,title:n,children:i,size:a=`md`}){let s=(0,d.useRef)(null),c=(0,d.useRef)(null),l=(0,d.useRef)(null),u=(0,d.useRef)(null),m=(0,d.useId)();return(0,d.useEffect)(()=>(e?(u.current=document.activeElement instanceof HTMLElement?document.activeElement:null,document.body.style.overflow=`hidden`):document.body.style.overflow=``,()=>{document.body.style.overflow=``}),[e]),(0,d.useEffect)(()=>{if(!e)return;l.current?.focus();function n(e){e.key===`Escape`&&t()}function r(e){if(e.key!==`Tab`||!c.current)return;let t=c.current.querySelectorAll(`button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`);if(t.length===0){e.preventDefault(),c.current.focus();return}let n=t[0],r=t[t.length-1],i=document.activeElement;e.shiftKey&&i===n?(e.preventDefault(),r?.focus()):!e.shiftKey&&i===r&&(e.preventDefault(),n?.focus())}return window.addEventListener(`keydown`,n),window.addEventListener(`keydown`,r),()=>{window.removeEventListener(`keydown`,n),window.removeEventListener(`keydown`,r),u.current?.focus()}},[e,t]),e?(0,f.jsxs)(`div`,{ref:s,className:`fixed inset-0 z-50 flex items-center justify-center sm:p-4`,onClick:e=>{e.target===s.current&&t()},children:[(0,f.jsx)(`div`,{className:`fixed inset-0 bg-black/40 backdrop-blur-[2px]`}),(0,f.jsxs)(`div`,{ref:c,role:`dialog`,"aria-modal":`true`,"aria-labelledby":m,tabIndex:-1,className:r(`relative w-full h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-modal flex flex-col`,`animate-fade-in`,p[a]),children:[(0,f.jsxs)(`div`,{className:`flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0`,children:[(0,f.jsx)(`h2`,{id:m,className:`text-lg font-bold text-gray-900 truncate mr-4`,children:n||`Information`}),(0,f.jsx)(`button`,{ref:l,onClick:t,className:`w-11 h-11 -mr-2 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-100/10 transition-colors cursor-pointer`,"aria-label":`Fermer`,children:(0,f.jsx)(o,{className:`h-6 w-6`})})]}),(0,f.jsx)(`div`,{className:`p-6 overflow-y-auto flex-1`,children:i})]})]}):null}var d,f,p,m=t((()=>{d=e(n(),1),s(),i(),f=a(),p={sm:`sm:max-w-md`,md:`sm:max-w-lg`,lg:`sm:max-w-2xl`,xl:`sm:max-w-4xl`},u.__docgenInfo={description:``,methods:[],displayName:`Modal`,props:{open:{required:!0,tsType:{name:`boolean`},description:``},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},title:{required:!1,tsType:{name:`string`},description:``},children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg' | 'xl'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`},{name:`literal`,value:`'xl'`}]},description:``,defaultValue:{value:`'md'`,computed:!1}}}}})),h,g,_,v,y;t((()=>{h=e(n(),1),c(),m(),g=a(),_={title:`UI/Modal`,component:u},v={args:{open:!0,onClose:()=>void 0,title:`Confirmer l’action`,size:`md`,children:null},render:()=>(0,g.jsx)(()=>{let[e,t]=(0,h.useState)(!0);return(0,g.jsxs)(`div`,{className:`min-h-[320px] min-w-[320px]`,children:[(0,g.jsx)(l,{onClick:()=>t(!0),children:`Ouvrir`}),(0,g.jsx)(u,{open:e,onClose:()=>t(!1),title:`Confirmer l’action`,children:(0,g.jsxs)(`div`,{className:`space-y-4`,children:[(0,g.jsx)(`p`,{className:`text-sm text-gray-600`,children:`Cette story valide le rendu du dialog et la hiérarchie visuelle.`}),(0,g.jsxs)(`div`,{className:`flex gap-2`,children:[(0,g.jsx)(l,{variant:`secondary`,onClick:()=>t(!1),children:`Annuler`}),(0,g.jsx)(l,{onClick:()=>t(!1),children:`Confirmer`})]})]})})]})},{})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onClose: () => undefined,
    title: 'Confirmer l’action',
    size: 'md',
    children: null
  },
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      return <div className="min-h-[320px] min-w-[320px]">\r
          <Button onClick={() => setOpen(true)}>Ouvrir</Button>\r
          <Modal open={open} onClose={() => setOpen(false)} title="Confirmer l’action">\r
            <div className="space-y-4">\r
              <p className="text-sm text-gray-600">Cette story valide le rendu du dialog et la hiérarchie visuelle.</p>\r
              <div className="flex gap-2">\r
                <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>\r
                <Button onClick={() => setOpen(false)}>Confirmer</Button>\r
              </div>\r
            </div>\r
          </Modal>\r
        </div>;
    };
    return <Demo />;
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`]}))();export{v as Default,y as __namedExportsOrder,_ as default};
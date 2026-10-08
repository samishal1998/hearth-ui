import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { packPackages } from "../scripts/pack-packages.mjs";

const root = resolve(".");
const work = mkdtempSync(join(tmpdir(), "hearth-package-"));
try {
  const packages = packPackages(join(work, "tarballs"));
  assert.equal(packages.length, 2);
  for (const pkg of packages) {
    const isVue = pkg.name === "@hearth-ui/vue";
    const consumer = join(work, isVue ? "vue-consumer" : "elements-consumer");
    mkdirSync(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: { [pkg.name]: `file:${pkg.path}` },
      }),
    );
    execFileSync(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--no-package-lock",
      ],
      { cwd: consumer, stdio: "inherit" },
    );
    const installed = join(consumer, "node_modules", pkg.name);
    const manifest = JSON.parse(
      readFileSync(join(installed, "package.json"), "utf8"),
    );
    assert.equal(manifest.license, "MIT");
    assert.equal(manifest.publishConfig.access, "public");
    for (const file of [
      "dist/types/index.d.ts",
      "dist/themes.css",
      "dist/primitives.css",
      "llms.txt",
      "docs/components/multi-select/llms.txt",
      "docs/primitives/llms.txt",
      "LICENSE",
      "README.md",
    ])
      assert.ok(
        existsSync(join(installed, file)),
        `Missing ${pkg.name}/${file}`,
      );
    if (isVue) {
      assert.equal(manifest.peerDependencies.vue, "^3.5.0");
      assert.ok(existsSync(join(consumer, "node_modules/vue")));
      assert.ok(existsSync(join(installed, "dist/vue/index.js")));
      assert.ok(existsSync(join(installed, "dist/vue/hearth-ui.css")));
      assert.equal(
        existsSync(join(installed, "dist/elements")),
        false,
        "Vue archive must not carry the element runtime",
      );
      writeFileSync(
        join(consumer, "consumer.ts"),
        `import { h } from 'vue';
import { HInput, HTheme, HMultiSelect, HCalendar, HDateRangePicker, HNumberInput, HRangeSlider, themeStyle } from '@hearth-ui/vue';
h(HInput, { label: 'Name', modelValue: 'Home' });
h(HMultiSelect, { label: 'Providers', modelValue: ['media'], options: [{value:'media',label:'Media'}] });
h(HTheme, {tokens:themeStyle({'--h-accent':'#ff7a2f'})});
h(HNumberInput,{label:'Count',modelValue:null});
h(HDateRangePicker,{label:'Window',modelValue:['2024-02-28','2024-03-02']});
h(HCalendar,{month:'2024-02'});h(HRangeSlider,{label:'Interval',modelValue:[20,80]});
import { HSurface, HButton, iconNames, themeProfileCSS, type ThemeProfile, type IconDefinition } from '@hearth-ui/vue';
const profile:ThemeProfile={tokens:{'--h-radius-card':'9px'},modeTokens:{dark:{'--h-bg':'#111111'},light:{'--h-bg':'#eeeeee'}}};
const glyph:IconDefinition={viewBox:'0 0 24 24',paths:['M3 3h18v18H3z']};
h(HTheme,profile);h(HSurface,{as:'section',tone:'inset',padding:'sm'});h(HButton,{icon:glyph,iconOnly:true,label:'Inspect'});
h(HInput,{label:'Search',hideLabel:true,size:'compact',type:'search',leadingIcon:glyph,clearable:true});
const exported:string=themeProfileCSS(profile);const names:readonly string[]=iconNames;
import {HStack,HGrid,HHeading,HPane,HMessage,HListbox,HTreeView,HVirtualList,HResizablePane,bindField,nextCollectionId,type TreeItem} from '@hearth-ui/vue';
h(HStack,{direction:'row',wrap:true});h(HGrid,{minColumnWidth:'240px'});h(HHeading,{level:3,size:'lg'});h(HPane,{title:'Inspector',open:true});h(HMessage,{roleLabel:'Assistant'});
const nodes:TreeItem[]=[{id:'one',label:'First',children:[{id:'child',label:'Child'}]}];h(HTreeView,{label:'Tree',items:nodes});h(HListbox,{label:'Choose',options:[{value:'one',label:'First'}]});h(HVirtualList,{label:'Window',items:[{id:'one',label:'First'}]});h(HResizablePane,{modelValue:320});
const next:string|undefined=nextCollectionId([{id:'one'},{id:'two'}],'one','ArrowDown');
`,
      );
      execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import {h,createSSRApp} from 'vue';import {renderToString} from 'vue/server-renderer';import {HTheme,HInput,HCalendar,HDateRangePicker,HNumberInput} from '@hearth-ui/vue';const html=await renderToString(createSSRApp({render:()=>h(HTheme,{},()=>[h(HInput,{label:'Installed Vue input'}),h(HCalendar,{month:'2024-02',today:'2024-02-29'}),h(HDateRangePicker,{label:'Report window',value:['2024-02-28','2024-03-02']}),h(HNumberInput,{label:'Count',modelValue:null})])}));if(!html.includes('Installed Vue input')||!html.includes('February 29, 2024')||!html.includes('Report window'))throw new Error('SSR export failed');console.log('Installed Vue package renders on the server.');`,
        ],
        { cwd: consumer, stdio: "inherit" },
      );
    } else {
      assert.equal(Object.keys(manifest.dependencies || {}).length, 0);
      assert.equal(Object.keys(manifest.peerDependencies || {}).length, 0);
      assert.equal(
        existsSync(join(consumer, "node_modules/vue")),
        false,
        "Elements install must not bring Vue into the host",
      );
      assert.equal(existsSync(join(installed, "dist/vue")), false);
      assert.equal(existsSync(join(installed, "dist/types/components")), false);
      assert.ok(existsSync(join(installed, "dist/elements/auto.js")));
      assert.ok(existsSync(join(installed, "dist/VUE-LICENSE")));
      assert.ok(existsSync(join(installed,'dist/primitives.css')));
      assert.ok(existsSync(join(installed,'docs/primitives/llms.txt')));
      for (const file of readdirSync(join(installed, "dist/types")))
        assert.doesNotMatch(
          readFileSync(join(installed, "dist/types", file), "utf8"),
          /(?:from\s+|import\()["']vue(?:["'/])/,
        );
      writeFileSync(
        join(consumer, "consumer.ts"),
        `import {HearthInputElement,HearthMultiSelectElement,HearthButtonElement,HearthThemeElement,registerElements,themeStyle,type AuthCredentials} from '@hearth-ui/elements';
const field=new HearthInputElement({label:'Name'});field.modelValue='Hello';field.checkValidity();
// @ts-expect-error string fields reject numbers
field.modelValue=123;
field.addEventListener('change', event=>{const value:string=event.detail[0];
// @ts-expect-error custom event payload stays a string
const wrong:number=event.detail[0];
});
const multi=new HearthMultiSelectElement();multi.modelValue=['media'];multi.options=[{value:'media',label:'Media'}];
// @ts-expect-error multi-selection requires an array
multi.modelValue='media';
multi.addEventListener('change',event=>{const values:string[]=event.detail[0]});
const button=new HearthButtonElement();button.addEventListener('click',event=>{const x:number=event.clientX;const detail:number=event.detail});
const theme=new HearthThemeElement();theme.tokens=themeStyle({'--h-accent':'#ff7a2f'});
theme.mobileBreakpoint=768;
// @ts-expect-error breakpoint properties use numbers, not CSS length strings
theme.mobileBreakpoint='768px';
const credentials:AuthCredentials={username:'owner',password:'test-only'};
import {HearthSurfaceElement,iconNames,themeProfileCSS,type ThemeProfile,type IconDefinition} from '@hearth-ui/elements';
const profile:ThemeProfile={tokens:{'--h-radius-card':'9px'},modeTokens:{dark:{'--h-bg':'#111111'},light:{'--h-bg':'#eeeeee'}}};
theme.modeTokens=profile.modeTokens;const css:string=themeProfileCSS(profile,{target:'elements'});
const glyph:IconDefinition={paths:['M3 3h18v18H3z']};button.icon=glyph;field.leadingIcon=glyph;field.hideLabel=true;field.size='compact';field.clearable=true;
const surface=new HearthSurfaceElement({as:'section',tone:'inset',padding:'sm'});const names:readonly string[]=iconNames;
// @ts-expect-error structural surfaces do not turn into arbitrary interactive tags
surface.as='button';
import {HearthPaneElement,HearthMessageElement,HearthStackElement,HearthTreeViewElement,HearthVirtualListElement,HearthListboxElement,HearthResizablePaneElement,bindField,observePopup,createOverlayController,nextCollectionId,type TreeItem} from '@hearth-ui/elements';
const nodes:TreeItem[]=[{id:'one',label:'First',children:[{id:'child',label:'Child'}]}];new HearthTreeViewElement({label:'Tree',items:nodes}).addEventListener('activate',event=>{const id:string=event.detail[0]});
new HearthVirtualListElement({label:'Window',items:[{id:'one',label:'First'}],rowHeight:48});new HearthPaneElement({title:'Inspector',open:true}).addEventListener('update:open',event=>{const open:boolean=event.detail[0]});
new HearthStackElement({direction:'row',wrap:true});new HearthMessageElement({roleLabel:'Assistant'});new HearthListboxElement({label:'Choose',options:[{value:'one',label:'First'}]});new HearthResizablePaneElement({modelValue:320});
const native=document.createElement('input'),label=document.createElement('label');const binding=bindField(native,{label});binding.update({validationMessage:'Required'});binding.dispose();
const popup=document.createElement('div'),placement=observePopup(()=>new DOMRect(0,0,1,1),popup);placement.update();placement.dispose();const overlay=createOverlayController(document.createElement('dialog'));overlay.dispose();
import {createFormControlController} from '@hearth-ui/elements';
const internals={} as ElementInternals;const custom=createFormControlController(internals,{getValue:()=>new FormData(),onRestore:(value,mode)=>{const restoreMode:'restore'|'autocomplete'|undefined=mode;}});custom.setCustomValidity('Invalid');custom.sync();custom.dispose();
import {HearthFileUploadElement,HearthDataTableElement,HearthToasterElement,tableCellSlot,type TableRow,type ToastItem} from '@hearth-ui/elements';
const upload=new HearthFileUploadElement({multiple:true});upload.checkValidity();upload.modelValue=[new File(['{}'],'config.json')];
upload.addEventListener('change',event=>{const files:File[]=event.detail[0]});
// @ts-expect-error file models contain files, not filenames
upload.modelValue=['config.json'];
const rows:TableRow[]=[{id:'one',name:'Example'}];const table=new HearthDataTableElement({rows,columns:[{key:'name',label:'Name'}]});
table.addEventListener('update:selected',event=>{const selected:string[]=event.detail[0]});
const slot:string=tableCellSlot('one','name');
const items:ToastItem[]=[{id:'saved',title:'Saved'}];new HearthToasterElement({items});
import {HearthTimelineElement,type TimelineItem} from '@hearth-ui/elements';
const activity:TimelineItem[]=[{id:'deployed',title:'Deployment healthy',tone:'success',dateTime:'2026-09-19T12:04:00Z'}];
const timeline=new HearthTimelineElement({items:activity,label:'Deployment history'});timeline.loading=true;
import {HearthNumberInputElement,HearthTimePickerElement,HearthThemeSwitcherElement,HearthCalendarElement,HearthDatePickerElement,HearthDateRangePickerElement,HearthRangeSliderElement,HearthStepperElement,type DateRange,type NumberRange} from '@hearth-ui/elements';
new HearthNumberInputElement({label:'Workers',modelValue:null}).addEventListener('change',event=>{const value:number|null=event.detail[0]});
new HearthTimePickerElement({label:'Time',step:900}).checkValidity();
new HearthThemeSwitcherElement({value:'system'}).addEventListener('change',event=>{const mode:'light'|'dark'|'system'=event.detail[0]});
new HearthCalendarElement({month:'2024-02',disabledDates:['2024-02-29']});
new HearthDatePickerElement({label:'Date',value:'2024-02-28',mobileBreakpoint:0}).checkValidity();
new HearthDateRangePickerElement({label:'Dates',value:['2024-02-28','2024-03-02']}).addEventListener('change',event=>{const dates:DateRange=event.detail[0]});
new HearthRangeSliderElement({label:'Range',value:[20,80]}).addEventListener('change',event=>{const range:NumberRange=event.detail[0]});
new HearthStepperElement({items:[{id:'one',label:'First'}],interactive:true});
// @ts-expect-error timeline items need stable IDs
timeline.items=[{title:'Missing identity'}];
customElements.define('sample-input',HearthInputElement);registerElements();
`,
      );
      execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `const ui=await import('@hearth-ui/elements');ui.registerElements();await import('@hearth-ui/elements/auto');if(!ui.HearthAuthPageElement||!ui.HearthSurfaceElement||!ui.themeProfileCSS||!ui.iconNames.includes('search'))throw new Error('Missing elements exports');try{await import('vue');throw new Error('Unexpected Vue host dependency')}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e}console.log('Installed elements package imports without Vue or a browser.');`,
        ],
        { cwd: consumer, stdio: "inherit" },
      );
    }
    execFileSync(
      process.execPath,
      [
        join(root, "node_modules/typescript/bin/tsc"),
        "--noEmit",
        "--strict",
        "--module",
        "esnext",
        "--moduleResolution",
        "bundler",
        "--target",
        "es2022",
        "--lib",
        "ES2022,DOM",
        "consumer.ts",
      ],
      { cwd: consumer, stdio: "inherit" },
    );
  }
  console.log(
    "Both package smoke checks passed: archive contents, isolated installs, typed APIs/events, SSR-safe imports, and Vue-free elements.",
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}

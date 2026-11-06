import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent";
import {GridLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Grid/GridLayout";
import {GridItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Grid/GridItem";
import {Workout} from "./WorkoutLessons";

const MENU_TEXT_SIZE = 68;
const BUTTON_HEIGHT = 6.7;
const BUTTON_GAP = 2;

export type LessonView = {
  theme: "court" | "dance"; kicker: string; title: string; detail: string;
  record: string; primary: string; auxiliary: string; input: string; demo: boolean;
};
@component
export class WorkoutMenuUI extends BaseScriptComponent {
  readonly choose = new Event<Workout>();
  readonly primary = new Event<void>();
  readonly demo = new Event<void>();
  readonly auxiliary = new Event<void>();
  readonly input = new Event<void>();
  readonly setup = new Event<void>();
  readonly setupHeight = new Event<number>();
  readonly recenter = new Event<void>();
  readonly setupDone = new Event<void>();
  private library: SceneObject;
  private setupPanel: SceneObject;
  private setupValue: Text;
  private lesson: SceneObject;
  private kicker: Text;
  private title: Text;
  private detail: Text;
  private record: Text;
  private play: ElementContent;
  private back: ElementContent;
  private extra: ElementContent;
  private source: ElementContent;
  private demoButton: ElementContent;
  private lessonPlate: BackPlate;
  private buttonRow: GridLayout;
  private lessonButtons: {control:ElementContent; width:number; item:GridItem}[] = [];
  private buttonLayout = "";
  private built = false;
  private libraryOpen = true;
  onAwake() { this.createEvent("OnStartEvent").bind(() => this.build()); }
  private node(name: string, parent: SceneObject, x=0, y=0, z=0) {
    const o=global.scene.createSceneObject(name); o.setParent(parent);
    o.getTransform().setLocalPosition(new vec3(x,y,z)); return o;
  }
  private text(parent: SceneObject, name: string, value: string, size: number, y: number, width=68) {
    const o=this.node(name,parent,0,y,1.6), t=o.createComponent("Component.Text") as Text;
    t.size=size; t.text=value; t.depthTest=true; t.horizontalAlignment=HorizontalAlignment.Center;
    t.verticalAlignment=VerticalAlignment.Center; t.horizontalOverflow=HorizontalOverflow.Overflow;
    t.verticalOverflow=VerticalOverflow.Overflow; t.layoutRect=Rect.create(-width/2,width/2,-2.4,2.4);
    t.textFill.color=new vec4(.96,.99,1,1);
    t.outlineSettings.enabled=true; t.outlineSettings.size=.16;
    t.outlineSettings.fill.color=new vec4(.02,.06,.09,1);
    return t;
  }
  private plate(parent: SceneObject, name: string, w: number, h: number) {
    const p=this.node(name,parent).createComponent(BackPlate.getTypeName()) as BackPlate;
    p.size=new vec2(w,h); p.style="dark";
    return p;
  }
  private button(parent: SceneObject,name: string,label: string,w: number,x: number,y: number,fn:()=>void) {
    const o=this.node(name,parent,x,y,2);
    const b=o.createComponent(Button.getTypeName()) as Button;
    b.setVariant({theme:"SnapOS2",shape:"Rectangle",style:"PrimaryNeutral"}); b.size=new vec3(w,BUTTON_HEIGHT,1);
    b.onTriggerUp.add(fn);
    const c=o.createComponent(ElementContent.getTypeName()) as ElementContent;
    c.autoResize=false; c.sizeOverride=new vec2(w,BUTTON_HEIGHT); c.textSize=MENU_TEXT_SIZE; c.text=label; return c;
  }
  private build() {
    this.sceneObject.createComponent("Component.Canvas");
    this.library=this.node("Workout selection",this.sceneObject,0,-22,0);
    const libraryPlate=this.plate(this.library,"Club menu plate",73,54);
    libraryPlate.sceneObject.getTransform().setLocalPosition(new vec3(0,-4,0));
    this.text(this.library,"Club edition","M O V E M E N T   C L U B     /     0 1",49,17).textFill.color=new vec4(.58,1,.8,1);
    this.text(this.library,"Club title","Choose a workout",125,11.8);
    const gridNode=this.node("Workout choices",this.library,0,-5,1);
    const grid=gridNode.createComponent(GridLayout.getTypeName()) as GridLayout;
    grid.onInitialized.add(()=>{grid.width=66;grid.height=25;grid.templateColumns="1fr 1fr";grid.templateRows="1fr 1fr 1fr";});
    const cell=(o:SceneObject,row:number,col:number)=>{
      const item=o.createComponent(GridItem.getTypeName()) as GridItem;
      item.autoPlacement=false;item.gridRow=row;item.gridColumn=col;grid.addItems([item]);
    };
    const games: [Workout,string,string][]=[
      ["park","Park Circuit","01   /   Rhythm workout"],
      ["court","Court Coach","02   /   Badminton footwork"],
      ["dance","Dance Trail","03   /   Eight-count phrase"]
    ];
    games.forEach(([id,name,subtitle],row)=>{
      const b=this.button(gridNode,name,name,29,0,0,()=>this.choose.invoke(id));
      cell(b.sceneObject,row,0);
      const t=this.text(gridNode,"Menu note "+id,subtitle,MENU_TEXT_SIZE,0,31);cell(t.sceneObject,row,1);
    });
    this.button(this.library,"Shared setup","Setup",20,0,-25,()=>this.setup.invoke());
    this.setupPanel=this.node("Shared workout setup",this.sceneObject,0,-16,0);
    this.plate(this.setupPanel,"Shared setup plate",86,34);
    this.text(this.setupPanel,"Setup title","Set your practice space",100,11.5);
    const help=this.text(this.setupPanel,"Setup guidance","Stand at the centre of a clear space.\nSet eye-to-floor height, then Recenter.",62,4.8,78);
    help.horizontalOverflow=HorizontalOverflow.Wrap;
    this.setupValue=this.text(this.setupPanel,"Shared eye height","",62,-2);
    this.button(this.setupPanel,"Eye lower","Eye −5",18,-29,-10,()=>this.setupHeight.invoke(-5));
    this.button(this.setupPanel,"Eye higher","Eye +5",18,-9,-10,()=>this.setupHeight.invoke(5));
    this.button(this.setupPanel,"Recenter workout","Recenter",21,12.5,-10,()=>this.recenter.invoke());
    this.button(this.setupPanel,"Setup done","Done",13,31.5,-10,()=>this.setupDone.invoke());
    this.lesson=this.node("Workout lesson controls",this.sceneObject);
    this.lessonPlate=this.plate(this.lesson,"Lesson plate",76,32);
    this.kicker=this.text(this.lesson,"Workout phase","",48,12.8);
    this.title=this.text(this.lesson,"Workout instruction","",112,7.6);
    this.detail=this.text(this.lesson,"Workout detail","",65,2);
    this.detail.horizontalOverflow=HorizontalOverflow.Wrap;
    this.record=this.text(this.lesson,"Workout score","",57,-3.1);
    const row=this.node("Lesson button row",this.lesson,0,-10.7,0);
    this.buttonRow=row.createComponent(GridLayout.getTypeName()) as GridLayout;
    this.buttonRow.onInitialized.add(()=>{this.buttonLayout="";this.layoutLessonButtons();});
    const control=(name:string,label:string,width:number,action:()=>void)=>{
      const c=this.button(row,name,label,width,0,0,action);
      const item=c.sceneObject.createComponent(GridItem.getTypeName()) as GridItem;
      item.autoPlacement=false;item.gridRow=0;
      this.lessonButtons.push({control:c,width,item});
      return c;
    };
    this.back=control("Workout menu","Menu",15,()=>this.choose.invoke("menu"));
    this.play=control("Lesson primary","Start Game",22,()=>this.primary.invoke());
    this.demoButton=control("Lesson demo","Watch demo",22,()=>this.demo.invoke());
    this.extra=control("Lesson option","Pace",13,()=>this.auxiliary.invoke());
    this.source=control("Lesson input","Mouse",13,()=>this.input.invoke());
    this.demoButton.sceneObject.enabled=false;
    this.built=true; this.layoutLessonButtons(); this.showLibrary(this.libraryOpen);
  }
  showLibrary(show:boolean) {
    this.libraryOpen=show;
    if (!this.built) return;
    this.library.enabled=show; this.lesson.enabled=!show;
    this.setupPanel.enabled=false;
  }
  showSetup(height:number,centered=false){
    if(!this.built)return;
    this.library.enabled=false;this.lesson.enabled=false;this.setupPanel.enabled=true;
    this.setupValue.text="Eye height  "+height+" cm   ·   All three games"+(centered?"   ·   Centred":"");
  }
  showLesson(v:LessonView) {
    if (!this.built) return;
    this.showLibrary(false);
    if(this.kicker.text!==v.kicker)this.kicker.text=v.kicker;
    if(this.title.text!==v.title)this.title.text=v.title;
    if(this.detail.text!==v.detail)this.detail.text=v.detail;
    if(this.record.text!==v.record)this.record.text=v.record;
    const color=v.theme==="court"?new vec4(.42,1,.87,1):new vec4(1,.64,.91,1);
    this.title.textFill.color=color;this.kicker.textFill.color=color;
    this.setButton(this.back,"Menu");
    this.setButton(this.play,v.primary);this.setButton(this.extra,v.auxiliary);this.setButton(this.source,v.input);
    this.demoButton.sceneObject.enabled=v.demo;
    this.layoutLessonButtons();
  }
  private layoutLessonButtons() {
    if(!this.built)return;
    const visible=this.lessonButtons.filter(b=>b.control.sceneObject.enabled);
    const key=visible.map(b=>b.control.sceneObject.name).join("|");
    if(key===this.buttonLayout)return;
    this.buttonLayout=key;
    // Keep full-size buttons in one centred row; grow the backing to fit.
    const width=visible.reduce((sum,b)=>sum+b.width,0)+Math.max(0,visible.length-1)*BUTTON_GAP;
    this.buttonRow.removeItems(this.lessonButtons.map(b=>b.item));
    visible.forEach((b,col)=>{b.item.gridColumn=col;});
    this.buttonRow.width=width;this.buttonRow.height=BUTTON_HEIGHT;
    this.buttonRow.columnGap=BUTTON_GAP;this.buttonRow.templateRows="1fr";
    this.buttonRow.templateColumns=visible.map(b=>b.width+"cm").join(" ");
    this.buttonRow.addItems(visible.map(b=>b.item));
    this.lessonPlate.size=new vec2(Math.max(76,width+7),32);
  }
  private setButton(button:ElementContent,label:string) {
    button.sceneObject.enabled=label.length>0;
    if(button.text!==label)button.text=label;
  }
}

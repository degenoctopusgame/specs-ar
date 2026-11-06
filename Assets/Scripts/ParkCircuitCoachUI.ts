import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent";

import {GridLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Grid/GridLayout";
import {GridItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Grid/GridItem";
import {CHART, Grade, cueName} from "./ParkCircuitState";

const HIT_INK=new vec4(0.52,1,0.17,1), MISS_INK=new vec4(1,0.29,0.33,1), LIGHT_INK=new vec4(0.90,0.98,1,1);
type CoachView={status:string;instruction:string;progress:string;primary:string;setup:boolean;paused:boolean;results:boolean;simulation:boolean;pace:string;score:number;streak:number;grade:Grade|null};

const BUTTON_HEIGHT = 5.4;
const MAIN_BUTTON_TEXT_SIZE = 70;

@component
export class ParkCircuitCoachUI extends BaseScriptComponent {
  @input panelWidth:number=42;
  @input @widget(new ColorWidget()) accent:vec4=new vec4(0.65,1,0.3,1);
  readonly onPrimary=new Event<void>(); readonly onPause=new Event<void>(); readonly onReset=new Event<void>();
  readonly onPace=new Event<void>(); readonly onMode=new Event<void>();
  readonly onGames=new Event<void>();
  readonly onRotate=new Event<void>(); readonly onResize=new Event<void>(); readonly onHeight=new Event<void>();
  private title:Text;private detail:Text;private kicker:Text;private info:Text;
  private plate:BackPlate;private options:SceneObject;
  private primary:ElementContent;private secondary:ElementContent;private pace:ElementContent;private mode:ElementContent;
  private scoreBoard:SceneObject;
  private points:Text;private streak:Text;private grade:Text;private move:Text;
  private shownGrade:Grade|null=null;
  private settingsOpen=false;
  private expanded=false;
  private view:CoachView;

  onAwake(){this.createEvent("OnStartEvent").bind(()=>this.build());}
  private build(){
    this.sceneObject.createComponent("Component.Canvas");
    const card=this.object(this.sceneObject,"Start sign back",0,0,0);
    this.plate=card.createComponent(BackPlate.getTypeName()) as BackPlate;
    this.plate.size=new vec2(this.panelWidth,20);
    this.kicker=this.text(this.sceneObject,"Input source",7.8,39);
    this.title=this.text(this.sceneObject,"Headline",3.9,124);this.title.textFill.color=this.accent;
    this.detail=this.text(this.sceneObject,"Direction",0,57);
    this.primary=this.button(this.sceneObject,"Start Game",-8,-5.8,22,MAIN_BUTTON_TEXT_SIZE,()=>this.onPrimary.invoke());
    this.button(this.sceneObject,"Menu",-32,-5.8,15,MAIN_BUTTON_TEXT_SIZE,()=>this.onGames.invoke());
    this.secondary=this.button(this.sceneObject,"Setup",12,-5.8,14,MAIN_BUTTON_TEXT_SIZE,()=>{
      if(this.view?.setup){this.settingsOpen=!this.settingsOpen;this.setView(this.view);}
      else if(this.view?.paused)this.onReset.invoke();
      else this.onPause.invoke();
    });
    this.options=this.object(this.sceneObject,"Setup options",0,-12,1);
    this.info=this.text(this.options,"Course configuration",0,47);
    this.button(this.options,"Turn",-13,-5.2,11,51,()=>this.onRotate.invoke());
    this.button(this.options,"Size",0,-5.2,11,51,()=>this.onResize.invoke());
    this.button(this.options,"Eye +5",13,-5.2,11,51,()=>this.onHeight.invoke());
    this.pace=this.button(this.options,"Relaxed",-9,-11.6,16,50,()=>this.onPace.invoke());
    this.mode=this.button(this.options,"Preview sim",9,-11.6,17,50,()=>this.onMode.invoke());
    this.options.enabled=false;
    this.buildScoreboard();
  }
  private buildScoreboard(){
    this.scoreBoard=this.object(this.sceneObject,"Scoreboard",0,16.9,0);
    const backing=this.object(this.scoreBoard,"Scoreboard backing",0,0,0);
    const plate=backing.createComponent(BackPlate.getTypeName()) as BackPlate;
    plate.size=new vec2(53,11.8);plate.style="dark";
    const content=this.object(this.scoreBoard,"Score grid",0,0,0);
    const grid=content.createComponent(GridLayout.getTypeName()) as GridLayout;
    grid.onInitialized.add(()=>{
      grid.width=51;grid.height=10.8;grid.templateColumns="1fr 1fr";grid.templateRows="1.15fr 1fr";
    });
    const cell=(name:string,size:number,row:number,col:number)=>{
      const t=this.text(content,name,0,size);
      t.layoutRect=Rect.create(-12.25,12.25,-2.25,2.25);
      t.weight=row===0?700:600;t.textFill.color=LIGHT_INK;
      t.outlineSettings.enabled=true;t.outlineSettings.size=0.18;
      t.outlineSettings.fill.color=new vec4(0.02,0.04,0.06,1);
      const item=t.sceneObject.createComponent(GridItem.getTypeName()) as GridItem;
      item.autoPlacement=false;item.gridRow=row;item.gridColumn=col;
      grid.addItems([item]);return t;
    };
    this.points=cell("Points",132,0,0);this.grade=cell("Last grade",138,0,1);
    this.streak=cell("Streak",85,1,0);this.move=cell("Last move",80,1,1);
    this.scoreBoard.enabled=false;
  }
  setView(v:CoachView){
    this.view=v;
    if(!this.title)return;
    if(!v.setup)this.settingsOpen=false;
    const open=v.setup && this.settingsOpen;
    if(open!==this.expanded){
      this.expanded=open;this.options.enabled=open;
      this.plate.size=new vec2(this.panelWidth,open?38:20);
      this.plate.sceneObject.getTransform().setLocalPosition(new vec3(0,open?-9:0,0));
    }
    this.scoreBoard.enabled=!v.setup;
    if(!v.setup){
      this.label(this.points,v.score+" PTS");
      this.label(this.streak,"STREAK  ×"+v.streak);
      const hit=v.grade && v.grade.points>0;
      this.label(this.grade,v.grade?(hit?"HIT  +"+v.grade.points:"MISS  +0"):"READY");
      this.label(this.move,v.grade?cueName(CHART[v.grade.index]).toUpperCase():"FIRST CUE AHEAD");
      if(this.shownGrade!==v.grade){
        this.shownGrade=v.grade;this.grade.textFill.color=v.grade?(hit?HIT_INK:MISS_INK):LIGHT_INK;
      }
    }
    this.label(this.kicker,(v.simulation?"PREVIEW SIM":"HEAD + HANDS")+"   /   "+(v.setup?"120 BPM":v.progress));
    this.label(this.title,v.setup?"PARK CIRCUIT":v.status);
    this.label(this.detail,v.instruction);
    this.label(this.primary,v.primary);
    this.label(this.secondary,v.setup?(open?"Done":"Setup"):v.paused?"Restart":"Pause");
    this.label(this.info,v.progress);this.label(this.pace,v.pace);
    this.label(this.mode,v.simulation?"Use headset":"Preview sim");
    this.mode.sceneObject.enabled=global.deviceInfoSystem.isEditor();
    this.secondary.sceneObject.enabled=!v.results;
  }
  blocksCourseTap(worldOrigin:vec3,worldTarget:vec3):boolean {
    const inverse=this.sceneObject.getTransform().getInvertedWorldTransform();
    const a=inverse.multiplyPoint(worldOrigin),b=inverse.multiplyPoint(worldTarget),dz=b.z-a.z;
    if(Math.abs(dz)<0.0001)return false;
    const t=(1.8-a.z)/dz;
    if(t<0)return false;
    const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
    const onSign=Math.abs(x)<=this.panelWidth/2 && Math.abs(y)<=10;
    const onScore=this.scoreBoard.enabled && Math.abs(x)<=26.5 && Math.abs(y-16.9)<=5.9;
    return onSign || onScore;
  }
  private label(control:Text|ElementContent,value:string){if(control.text!==value)control.text=value;}
  private object(parent:SceneObject,name:string,x:number,y:number,z:number){
    const o=global.scene.createSceneObject(name);o.setParent(parent);o.getTransform().setLocalPosition(new vec3(x,y,z));return o;
  }
  private text(parent:SceneObject,name:string,y:number,size:number){
    const o=this.object(parent,name,0,y,1.2);
    const t=o.createComponent("Component.Text") as Text;
    t.size=size;t.depthTest=true;t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;
    t.horizontalOverflow=HorizontalOverflow.Overflow;t.verticalOverflow=VerticalOverflow.Overflow;
    t.layoutRect=Rect.create(-this.panelWidth/2,this.panelWidth/2,-2,2);return t;
  }
  private button(parent:SceneObject,name:string,x:number,y:number,w:number,size:number,action?:()=>void,style="PrimaryNeutral"){
    const o=this.object(parent,name,x,y,1.8);
    const b=o.createComponent(Button.getTypeName()) as Button;
    b.setVariant({theme:"SnapOS2",shape:"Rectangle",style});b.size=new vec3(w,BUTTON_HEIGHT,1);
    if(action)b.onTriggerUp.add(action);
    const c=o.createComponent(ElementContent.getTypeName()) as ElementContent;
    c.text=name;c.textSize=size;c.autoResize=false;c.sizeOverride=new vec2(w,BUTTON_HEIGHT);return c;
  }
}

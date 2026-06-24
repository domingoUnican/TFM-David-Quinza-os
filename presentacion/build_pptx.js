const pptxgen = require("pptxgenjs");
const A = "/sessions/sweet-focused-cori/mnt/TFM_David_Quinzanos/presentacion/assets/";
const NAVY="13294B", BERRY="7A1426", INK="1F2937", MUTED="6B7280",
      TINT="EEF1F6", TINTB="F4ECEE", GREEN="1F7A4D", BLUE="2B4C8C",
      RED="B23A48", WHITE="FFFFFF", LINE="D6DBE3";
const TF="Cambria", BF="Calibri";
const pres = new pptxgen();
pres.defineLayout({ name:"W", width:13.33, height:7.5 });
pres.layout = "W";
pres.author = "David Quinzanos Saiz";
pres.title = "Busqueda de factores RSA compartidos: Binary Tree Batch GCD";
const DIM = {
  "uc-logo.png":[1514,393], "tls_handshake.png":[605,972], "fig_rsa_keygen.png":[1505,569],
  "fig_gcd_compartido.png":[1044,390], "fig_clasico_tree.png":[1237,496],
  "fig_binary_tree.png":[1396,746], "fig_pipeline_ct.png":[836,573],
  "fig_cadena_causal.png":[810,512], "chart_tiempo.png":[3169,1672],
  "chart_memoria.png":[3168,1672], "benchmark_speedup_cpp.png":[2177,1238],
  "chart_escalabilidad.png":[1777,975], "distribucion_bits_modulos.png":[1800,900],
  "tiempo_por_fase_batch_gcd.png":[1600,900], "ctlogs_top_modulos.png":[1976,1178],
  "diag_global.png":[798,1062]
};
function fit(file, px, py, boxW, boxH){
  const d=DIM[file]; const r=Math.min(boxW/d[0], boxH/d[1]);
  const w=d[0]*r, h=d[1]*r;
  return { path:A+file, x: px+(boxW-w)/2, y: py+(boxH-h)/2, w, h };
}
const sh = () => ({ type:"outer", color:"000000", blur:7, offset:3, angle:90, opacity:0.13 });
function header(slide, kicker, title){
  slide.background={color:WHITE};
  slide.addShape(pres.shapes.OVAL,{x:0.7,y:0.64,w:0.17,h:0.17,fill:{color:BERRY}});
  slide.addText(kicker.toUpperCase(),{x:0.98,y:0.55,w:11,h:0.32,fontFace:BF,fontSize:12.5,bold:true,color:BERRY,charSpacing:2,margin:0});
  slide.addText(title,{x:0.7,y:0.88,w:11.9,h:0.85,fontFace:TF,fontSize:27,bold:true,color:NAVY,margin:0});
}
let PAGE=0;
function footer(slide){
  PAGE++;
  slide.addText("Binary Tree Batch GCD sobre CT logs  -  D. Quinzanos Saiz",{x:0.7,y:7.08,w:9,h:0.3,fontFace:BF,fontSize:9,color:MUTED,margin:0});
  slide.addText(String(PAGE),{x:12.0,y:7.08,w:0.6,h:0.3,fontFace:BF,fontSize:9,color:MUTED,align:"right",margin:0});
}
function card(slide,x,y,w,h,fill){
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,rectRadius:0.08,fill:{color:fill||TINT},line:{color:LINE,width:1},shadow:sh()});
}
function bullets(slide,items,x,y,w,h,fs){
  slide.addText(items.map(t=>({text:t,options:{bullet:{indent:14},breakLine:true,paraSpaceAfter:8}})),
    {x,y,w,h,fontFace:BF,fontSize:fs||16,color:INK,valign:"top"});
}
let s = pres.addSlide(); s.background={color:WHITE};
s.addImage(fit("uc-logo.png",10.0,0.5,2.6,0.75));
s.addText("FACULTAD DE CIENCIAS",{x:0.8,y:0.62,w:7,h:0.3,fontFace:BF,fontSize:12,bold:true,color:MUTED,charSpacing:2});
s.addShape(pres.shapes.OVAL,{x:0.85,y:2.32,w:0.2,h:0.2,fill:{color:BERRY}});
s.addText("Busqueda de factores RSA compartidos en los registros de Transparencia de Certificados",
  {x:0.8,y:2.55,w:11.6,h:1.7,fontFace:TF,fontSize:33,bold:true,color:NAVY});
s.addText("Un enfoque basado en el algoritmo Binary Tree Batch GCD",
  {x:0.8,y:4.25,w:11.6,h:0.6,fontFace:TF,fontSize:19,italic:true,color:BERRY});
s.addText([
  {text:"David Quinzanos Saiz",options:{bold:true,fontSize:18,color:INK,breakLine:true,paraSpaceAfter:6}},
  {text:"Codirectores:  Ana I. Gomez Perez   -   Domingo Gomez Perez",options:{fontSize:13.5,color:MUTED,breakLine:true,paraSpaceAfter:3}},
  {text:"Master Interuniversitario (UC-UIMP) en Data Science   -   Junio de 2026",options:{fontSize:13.5,color:MUTED}},
],{x:0.8,y:5.45,w:11.6,h:1.4,fontFace:BF});
s.addNotes("(0:30) Buenos dias. Soy David Quinzanos y presento mi Trabajo de Fin de Master: la busqueda de factores RSA compartidos en los registros de Transparencia de Certificados, mediante el algoritmo Binary Tree Batch GCD. Codirigido por Ana y Domingo Gomez. Idea central: RSA es seguro si sus primos se generan bien; cuando no, dos claves pueden compartir un factor y el GCD lo revela. El reto es detectarlo a gran escala.");

s = pres.addSlide(); header(s,"Motivacion","La confianza en la Web descansa en los certificados");
bullets(s,[
  "HTTPS/TLS protege la comunicacion entre el navegador y el servidor.",
  "El navegador confia en un certificado X.509 firmado por una autoridad certificadora (CA).",
  "El certificado vincula una identidad (dominio) con una clave publica.",
  "Certificate Transparency obliga a publicar los certificados en logs publicos y auditables.",
],0.7,1.95,7.0,4.6,16.5);
s.addImage(fit("tls_handshake.png",8.4,1.85,4.2,5.0));
s.addText("Intercambio TLS (cliente-servidor)",{x:8.4,y:6.85,w:4.2,h:0.25,fontFace:BF,fontSize:9.5,italic:true,color:MUTED,align:"center"});
footer(s);
s.addNotes("(1:00) Toda la seguridad de la Web se apoya en la confianza en los certificados. Al entrar por HTTPS, TLS cifra la comunicacion, pero antes el navegador comprueba un certificado X.509 firmado por una CA, que vincula el dominio con su clave publica. Para vigilar este ecosistema surge Certificate Transparency: las CAs deben publicar todos los certificados en registros publicos, verificables y de solo anexado. Esos logs son una fuente enorme de claves publicas reales, y ahi nace este trabajo.");

s = pres.addSlide(); header(s,"Fundamentos","RSA y la importancia de los primos");
s.addText([
  {text:"N = p . q",options:{fontFace:TF,fontSize:30,bold:true,color:NAVY,breakLine:true,paraSpaceAfter:10}},
  {text:"Clave publica:  (N, e)",options:{fontFace:BF,fontSize:18,color:INK,breakLine:true,paraSpaceAfter:6}},
  {text:"Clave privada:  d = e^-1 (mod phi(N))",options:{fontFace:BF,fontSize:18,color:INK,breakLine:true,paraSpaceAfter:6}},
  {text:"asociada a la factorizacion de N",options:{fontFace:BF,fontSize:13.5,italic:true,color:MUTED}},
],{x:0.7,y:2.05,w:5.3,h:2.6});
bullets(s,[
  "p y q deben ser primos grandes, generados de forma aleatoria e independiente.",
  "La seguridad descansa en la dificultad de factorizar N.",
],0.7,4.6,5.5,1.8,15.5);
s.addImage(fit("fig_rsa_keygen.png",6.5,2.0,6.1,4.6));
footer(s);
s.addNotes("(1:10) RSA ha sido durante decadas el pilar de la criptografia de clave publica. Su modulo es N = p.q, producto de dos primos grandes. La clave publica es (N,e) y la privada se obtiene como inverso de e modulo phi(N), solo calculable si se conoce la factorizacion. La seguridad se basa en que factorizar N es inviable. Pero hay una condicion critica, en el esquema de generacion: p y q deben ser grandes e independientes entre claves. Si esa independencia falla, aparece la vulnerabilidad.");

s = pres.addSlide(); header(s,"El problema","Vulnerabilidad: factores primos compartidos");
s.addImage(fit("fig_gcd_compartido.png",1.6,1.9,10.1,3.5));
card(s,2.4,5.55,8.5,1.15,TINTB);
s.addText([
  {text:"Si dos modulos comparten un primo,  ",options:{fontSize:16,color:INK}},
  {text:"gcd(N1, N2) = p",options:{fontSize:16,bold:true,color:BERRY}},
  {text:"  recupera el factor y compromete ambas claves, sin factorizar.",options:{fontSize:16,color:INK}},
],{x:2.7,y:5.55,w:7.9,h:1.15,fontFace:BF,valign:"middle",align:"center"});
footer(s);
s.addNotes("(1:35) Aqui esta el corazon del problema. Dos claves cuyos modulos comparten, por error de generacion, el mismo primo p: N1=p.q1 y N2=p.q2. Entonces el GCD de los dos modulos es exactamente p. Calcular un GCD es trivial con Euclides. Con p, obtengo q1 y q2 por division y reconstruyo ambas claves privadas. Es decir: si dos modulos comparten un factor, ambas claves quedan comprometidas al instante, sin resolver la factorizacion. En condiciones ideales esto es casi imposible; si ocurre, delata un fallo de generacion.");

s = pres.addSlide(); header(s,"El reto","El problema de escala");
s.addText("M(M-1)/2",{x:0.7,y:2.2,w:6.0,h:1.2,fontFace:TF,fontSize:54,bold:true,color:NAVY,align:"center"});
s.addText("comparaciones para M modulos",{x:0.7,y:3.45,w:6.0,h:0.4,fontFace:BF,fontSize:15,italic:true,color:MUTED,align:"center"});
card(s,0.9,4.25,5.6,1.9,TINT);
s.addText([
  {text:"54.275",options:{fontFace:TF,fontSize:34,bold:true,color:BERRY,breakLine:true}},
  {text:"modulos reales analizados  ->",options:{fontSize:13,color:MUTED,breakLine:true,paraSpaceAfter:4}},
  {text:"1.472.860.675",options:{fontFace:TF,fontSize:22,bold:true,color:NAVY,breakLine:true}},
  {text:"comparaciones por fuerza bruta",options:{fontSize:12.5,color:MUTED}},
],{x:1.15,y:4.4,w:5.1,h:1.7,fontFace:BF,valign:"top"});
bullets(s,[
  "Calcular un GCD aislado es barato...",
  "...pero comparar todos los pares crece de forma cuadratica.",
  "Inviable para millones de claves.",
  "Necesitamos un enfoque global: batch GCD.",
],7.1,2.2,5.5,4.2,17);
footer(s);
s.addNotes("(1:20) El problema no es calcular un GCD -es barato-, sino que no sabemos que pares comparten factores. La estrategia ingenua compara todos los pares: M por M-1 partido por 2, que crece de forma cuadratica. Para 54.275 modulos serian casi mil quinientos millones de comparaciones, y es un conjunto pequeno frente a la literatura. La fuerza bruta no escala. De ahi los algoritmos batch GCD, que reorganizan el calculo globalmente.");

s = pres.addSlide(); header(s,"Punto de partida","La tesis de Vage: auditar CT logs");
bullets(s,[
  "Vage (2022, Univ. de Bergen) toma los CT logs como fuente de claves RSA reales.",
  "Demuestra que auditar esas claves tiene sentido practico y sigue dando resultados.",
  "Deja abierta la idea clave: mejorar el algoritmo permitiria analisis mucho mayores.",
],0.7,1.95,6.7,3.6,16.5);
const st=[["159.377.664","claves RSA-2048 de CT logs"],["8","claves vulnerables (ZeroSSL)"],["355","claves unicas factorizadas (de >700.000)"]];
let yy=2.0;
st.forEach(d=>{ card(s,7.8,yy,4.8,1.35,TINT);
  s.addText(d[0],{x:8.05,y:yy+0.12,w:4.3,h:0.7,fontFace:TF,fontSize:26,bold:true,color:BERRY});
  s.addText(d[1],{x:8.05,y:yy+0.82,w:4.4,h:0.45,fontFace:BF,fontSize:12.5,color:MUTED});
  yy+=1.55; });
s.addText("Fuente: Vage (2022), Master's thesis, University of Bergen.",{x:0.7,y:6.5,w:8,h:0.3,fontFace:BF,fontSize:10,italic:true,color:MUTED});
footer(s);
s.addNotes("(1:50) El punto de partida aplicado es la tesis de Hannah Vage, 2022, Universidad de Bergen. Demuestra que los CT logs son una fuente excelente de claves RSA reales y que auditarlas tiene sentido practico. Recopilo mas de 159 millones de claves RSA-2048 -el mayor conjunto hasta entonces-, encontro ocho claves vulnerables, todas de ZeroSSL, y factorizo 355 claves unicas de mas de 700.000. Lo clave: solo se habia auditado una fraccion minima de los CT logs, y mejorar el algoritmo permitiria investigaciones mucho mayores. Ahi encaja este TFM.");

s = pres.addSlide(); header(s,"Estado del arte","Metodo clasico: product tree + remainder tree");
s.addImage(fit("fig_clasico_tree.png",1.0,1.85,11.3,4.0));
s.addText("Modulos -> product tree -> producto global P -> remainder tree -> GCD finales.  Evita la comparacion par a par reorganizando el calculo globalmente.",
  {x:1.2,y:6.0,w:10.9,h:0.7,fontFace:BF,fontSize:14.5,color:INK,align:"center",italic:true});
footer(s);
s.addNotes("(1:55) El metodo clasico batch GCD, que usa Vage, evita la comparacion ingenua. Primero multiplica jerarquicamente todos los modulos en un product tree hasta un producto global P. Luego, descendiendo, un remainder tree calcula en cada hoja el residuo de P respecto al modulo, y con el el GCD de cada clave frente al producto de las demas. En lugar de comparar pares uno a uno, el problema se reorganiza con operaciones sobre arboles. Es elegante y funciona, pero escalar tiene un coste.");

s = pres.addSlide(); header(s,"Estado del arte","Limitaciones del metodo clasico al escalar");
bullets(s,[
  "Los enteros intermedios en la cima del arbol son gigantescos.",
  "Alto coste en tiempo y, sobre todo, en memoria.",
  "Obliga a dividir la coleccion en lotes y cruzarlos entre si.",
],0.7,1.95,6.6,3.4,16.5);
const st2=[["13","lotes de ~12 M de claves"],["~180 GB","memoria RAM"],["~1 TB","almacenamiento en disco"],["~88 h","con 30 nucleos"]];
let gx=7.6, gy=2.0;
st2.forEach((d,i)=>{ const x=gx+(i%2)*2.55, y=gy+Math.floor(i/2)*1.55;
  card(s,x,y,2.35,1.35,TINTB);
  s.addText(d[0],{x:x+0.1,y:y+0.15,w:2.15,h:0.6,fontFace:TF,fontSize:21,bold:true,color:BERRY,align:"center"});
  s.addText(d[1],{x:x+0.1,y:y+0.78,w:2.15,h:0.5,fontFace:BF,fontSize:11.5,color:MUTED,align:"center"});
});
s.addText("Ejecucion principal descrita por Vage (2022).",{x:7.6,y:5.4,w:5,h:0.3,fontFace:BF,fontSize:10,italic:true,color:MUTED});
footer(s);
s.addNotes("(1:35) El metodo clasico no esta exento de limitaciones al escalar. El cuello de botella esta en la cima de los arboles, donde los enteros intermedios son enormes, lo que dispara tiempo y memoria. Por eso hay que dividir en lotes y cruzarlos. Las cifras de la tesis de Vage: su experimento principal se dividio en 13 lotes de unos 12 millones de claves, y requirio del orden de 180 GB de RAM, cerca de 1 TB de disco y unas 88 horas con 30 nucleos. Funciona, pero escalarlo exige recursos considerables. Esto justifica buscar una alternativa.");

s = pres.addSlide(); header(s,"Posicionamiento","De Vage a Pelofske: donde encaja este TFM");
const cards=[
  ["Vage (2022)",BLUE,["CT logs como fuente de claves RSA reales","batch GCD clasico","Problema aplicado"]],
  ["Pelofske (2024)",GREEN,["Binary Tree Batch GCD","Mejora algoritmica","Evita el remainder tree"]],
  ["Este TFM",BERRY,["Implementacion C++17/GMP","Comparacion con Python","Aplicacion a datos reales"]],
];
let cx=0.7;
cards.forEach((c,i)=>{
  const w=3.75, fillc = i===2?TINTB:TINT;
  card(s,cx,2.2,w,3.6,fillc);
  s.addText(c[0],{x:cx,y:2.45,w:w,h:0.55,fontFace:TF,fontSize:19,bold:true,color:c[1],align:"center"});
  s.addText(c[2].map(t=>({text:t,options:{bullet:{indent:12},breakLine:true,paraSpaceAfter:10}})),
    {x:cx+0.3,y:3.2,w:w-0.6,h:2.4,fontFace:BF,fontSize:14.5,color:INK,valign:"top"});
  if(i<2) s.addText(">",{x:cx+w-0.02,y:3.6,w:0.55,h:0.6,fontFace:BF,fontSize:30,bold:true,color:MUTED,align:"center"});
  cx+=w+0.55;
});
s.addText("El TFM toma el problema aplicado de Vage e incorpora la mejora algoritmica de Pelofske.",
  {x:0.7,y:6.1,w:11.9,h:0.5,fontFace:BF,fontSize:14.5,italic:true,color:INK,align:"center"});
footer(s);
s.addNotes("(1:10) Esta es la bisagra del trabajo. A la izquierda, Vage aporta el contexto aplicado: CT logs y batch GCD clasico. En el centro, Pelofske (2024) propone la mejora algoritmica, el Binary Tree Batch GCD, que evita el remainder tree. A la derecha, mi TFM se situa entre ambos: tomo el problema aplicado de Vage e incorporo la propuesta de Pelofske, con implementacion propia en C++/GMP, la comparo con Python y la aplico a datos reales. No es solo programar un algoritmo: es continuar una linea de investigacion.");

s = pres.addSlide(); header(s,"Algoritmo","Binary Tree Batch GCD (Pelofske, 2024)");
s.addImage(fit("fig_binary_tree.png",6.0,1.8,6.6,5.0));
bullets(s,[
  "Arbol binario de productos con gcd en linea.",
  "Agregacion de los GCD:  B = producto de g_j.",
  "Comprobacion final:  gcd(N_i, B).",
  "No construye el remainder tree.",
  "Solo 2M - 1 operaciones de gcd.",
],0.7,2.0,5.2,4.4,16.5);
footer(s);
s.addNotes("(1:50) La propuesta de Pelofske, nucleo metodologico, tiene tres fases. Primera: se construye un arbol binario de productos, calculando el GCD entre cada par de ramas hermanas sobre la marcha -lineas azules-. Segunda: todos esos GCD se multiplican en un unico entero B. Tercera: se recorre el conjunto original y, para cada modulo, se calcula gcd con B; si sale algo no trivial, hay un factor compartido. La clave: no construye el remainder tree y realiza solo 2M-1 operaciones de GCD, frente al numero cuadratico ingenuo. Misma complejidad asintotica, menor coste practico.");

s = pres.addSlide(); header(s,"Objetivos","Objetivos del Trabajo de Fin de Master");
const objs=[
  ["1","Estudiar la deteccion de factores primos compartidos en RSA.",MUTED],
  ["2","Revisar el batch GCD clasico y el Binary Tree Batch GCD.",MUTED],
  ["3","Implementar Binary Tree Batch GCD en C++17/GMP.",BERRY],
  ["4","Compararlo con las implementaciones Python de referencia.",BERRY],
  ["5","Aplicarlo a modulos RSA reales extraidos de CT-archive.",BERRY],
];
let oy=2.0;
objs.forEach(o=>{
  s.addShape(pres.shapes.OVAL,{x:0.9,y:oy,w:0.6,h:0.6,fill:{color:o[2]===BERRY?BERRY:NAVY}});
  s.addText(o[0],{x:0.9,y:oy,w:0.6,h:0.6,fontFace:TF,fontSize:22,bold:true,color:WHITE,align:"center",valign:"middle"});
  s.addText(o[1],{x:1.75,y:oy,w:9.3,h:0.6,fontFace:BF,fontSize:17,color:INK,valign:"middle",bold:o[2]===BERRY});
  oy+=0.92;
});
s.addText("Aportacion propia",{x:11.3,y:4.0,w:1.7,h:0.4,fontFace:BF,fontSize:11,bold:true,color:BERRY,align:"center"});
s.addShape(pres.shapes.LINE,{x:11.2,y:3.85,w:0,h:2.55,line:{color:BERRY,width:2.5}});
footer(s);
s.addNotes("(0:55) Los objetivos son cinco. Los dos primeros, de estudio: entender la vulnerabilidad y revisar el batch GCD clasico y el binary tree. Los tres siguientes, marcados a la derecha, son mi aportacion propia: implementar el Binary Tree Batch GCD en C++17/GMP, compararlo con las referencias Python, y aplicarlo a modulos RSA reales de CT-archive. Desarrollo, evaluacion y aplicacion.");

s = pres.addSlide(); header(s,"Aportacion","Implementacion desarrollada");
const tools=[["C++17","Lenguaje principal"],["GMP / GMP C++","Aritmetica multiprecision"],["OpenMP","Paralelizacion opcional"],["Python 3.12","Referencias de Pelofske"],["OpenSSL","Extraccion de modulos"],["ct-archive","Fuente de CT logs"]];
let tx=0.7, ty=2.0;
tools.forEach((t,i)=>{ const x=tx+(i%3)*3.95, y=ty+Math.floor(i/3)*1.45;
  card(s,x,y,3.7,1.25,TINT);
  s.addText(t[0],{x:x+0.2,y:y+0.18,w:3.3,h:0.5,fontFace:TF,fontSize:18,bold:true,color:NAVY});
  s.addText(t[1],{x:x+0.2,y:y+0.72,w:3.3,h:0.4,fontFace:BF,fontSize:12.5,color:MUTED});
});
s.addText([
  {text:"Por que C++17/GMP?  ",options:{bold:true,color:BERRY}},
  {text:"enteros muy grandes, eficiencia y control de memoria, con liberacion temprana de los nodos del arbol para contener el pico de RAM.",options:{color:INK}},
],{x:0.7,y:5.1,w:11.9,h:1.0,fontFace:BF,fontSize:15.5,valign:"middle"});
footer(s);
s.addNotes("(1:15) Mi implementacion esta en C++17 con GMP para la aritmetica de precision arbitraria, y usa OpenMP opcional para paralelizar la fase final. Como referencias mantengo, sin tocar su logica, las versiones Python del repositorio de Pelofske, lo que permite atribuir las diferencias al algoritmo y la implementacion, no a los datos. Para los datos reales uso OpenSSL, que extrae modulo y emisor de cada certificado, y ct-archive como fuente. Por que C++ y GMP? Por los enteros enormes: necesitamos eficiencia y control de memoria; una decision clave fue liberar los hijos de cada nodo en cuanto dejan de hacer falta.");

s = pres.addSlide(); header(s,"Aportacion","Flujo con datos reales de CT-archive");
s.addImage(fit("fig_pipeline_ct.png",0.8,1.8,7.2,5.1));
card(s,8.5,2.4,4.1,1.5,TINT);
s.addText([{text:"54.278",options:{fontFace:TF,fontSize:30,bold:true,color:NAVY,breakLine:true}},
  {text:"modulos unicos brutos",options:{fontSize:13,color:MUTED}}],
  {x:8.7,y:2.55,w:3.7,h:1.2,fontFace:BF,valign:"top"});
card(s,8.5,4.15,4.1,1.5,TINTB);
s.addText([{text:"54.275",options:{fontFace:TF,fontSize:30,bold:true,color:BERRY,breakLine:true}},
  {text:"modulos RSA plausibles",options:{fontSize:13,color:MUTED}}],
  {x:8.7,y:4.3,w:3.7,h:1.2,fontFace:BF,valign:"top"});
s.addText("Foco en certificados de issuer/ (CAs e intermediarias).",{x:8.5,y:5.85,w:4.1,h:0.6,fontFace:BF,fontSize:12,italic:true,color:MUTED});
footer(s);
s.addNotes("(1:20) Para los datos reales construi un flujo completo sobre ct-archive, incremental: descarga un ZIP con reanudacion, extrae los certificados de la carpeta issuer -autoridades e intermediarias-, y con OpenSSL obtiene modulo y emisor en hexadecimal. Despues normaliza y deduplica, porque un mismo modulo aparece muchas veces. Resultado: 54.278 modulos unicos brutos, que tras validacion quedan en 54.275 plausibles. Ese conjunto alimenta al binario en C++. Me centre en issuer porque es un subconjunto manejable que conserva la relacion modulo-emisor.");

s = pres.addSlide(); header(s,"Resultados","Experimentos sinteticos: diseno");
const cfg=[["Tamanos de modulo","1024 y 2048 bits"],["Claves debiles (WEAK)","2, 100, 1000"],["Tamano del conjunto (N)","2000, 5000, 10000"]];
let fy=2.0;
cfg.forEach(c=>{ card(s,0.7,fy,5.6,1.15,TINT);
  s.addText(c[0],{x:0.95,y:fy+0.13,w:5.1,h:0.4,fontFace:BF,fontSize:13.5,color:MUTED});
  s.addText(c[1],{x:0.95,y:fy+0.52,w:5.1,h:0.5,fontFace:TF,fontSize:19,bold:true,color:NAVY});
  fy+=1.35; });
s.addText("Tres algoritmos sobre la misma entrada",{x:6.7,y:2.0,w:5.9,h:0.45,fontFace:TF,fontSize:17,bold:true,color:BERRY});
bullets(s,[
  "Remainder Tree Batch GCD (Python).",
  "Binary Tree Batch GCD (Python).",
  "Binary Tree Batch GCD (C++/GMP), propia.",
],6.7,2.55,5.9,2.0,16);
card(s,6.7,4.75,5.9,1.4,TINTB);
s.addText([
  {text:"Permite separar dos efectos:  ",options:{bold:true,color:BERRY}},
  {text:"mejora algoritmica (Python vs Python) y mejora de implementacion (C++ vs Python).",options:{color:INK}},
],{x:6.95,y:4.75,w:5.4,h:1.4,fontFace:BF,fontSize:14.5,valign:"middle"});
footer(s);
s.addNotes("(1:20) Antes de los datos reales, valide y medi el algoritmo con experimentos sinteticos, replicando la estructura de Pelofske a escala asumible en un portatil. Combine dos tamanos de modulo, 1024 y 2048 bits; tres valores de claves debiles -2, 100 y 1000-; y tres tamanos de conjunto -2.000, 5.000 y 10.000-. Por cada configuracion, un unico archivo de modulos pasado por los tres algoritmos: remainder tree en Python, binary tree en Python, y mi binary tree en C++/GMP. Este diseno separa dos cosas: cuanta mejora viene del algoritmo -Python vs Python- y cuanta de la implementacion -C++ vs Python.");

s = pres.addSlide(); header(s,"Resultados","Validacion, tiempo y memoria");
s.addImage(fit("chart_tiempo.png",0.6,1.75,8.0,4.5));
s.addText("Tiempo de ejecucion (escala log)",{x:0.6,y:6.35,w:8.0,h:0.3,fontFace:BF,fontSize:10,italic:true,color:MUTED,align:"center"});
const res=[
  ["Validacion","Las 3 implementaciones detectan los mismos modulos vulnerables.",GREEN],
  ["Algoritmo","Binary Tree (Py) ~ 6,1x sobre el clasico.",BLUE],
  ["Implementacion","C++/GMP: 116,5x medio (max 275,3x) sobre el clasico.",BERRY],
  ["Memoria","Pico 57,9 MB: -55,0% vs clasico, -38,7% vs Binary Py.",NAVY],
];
let ry=1.9;
res.forEach(r=>{ card(s,8.85,ry,3.75,1.12,TINT);
  s.addText(r[0],{x:9.05,y:ry+0.1,w:3.4,h:0.35,fontFace:TF,fontSize:14.5,bold:true,color:r[2]});
  s.addText(r[1],{x:9.05,y:ry+0.45,w:3.45,h:0.62,fontFace:BF,fontSize:11.5,color:INK,valign:"top"});
  ry+=1.2; });
footer(s);
s.addNotes("(2:35) Resultados sinteticos, el nucleo experimental. Primero, validacion funcional: las tres implementaciones detectan exactamente los mismos modulos vulnerables en todas las configuraciones, y para cada factor comprobe que divide al modulo; mi version en C++ es correcta. Segundo, la grafica de tiempos en escala logaritmica: roja el clasico, azul el binary tree en Python y verde mi C++. El orden se mantiene en los seis paneles. En cifras: el binary tree en Python ya es unas 6,1 veces mas rapido que el clasico -mejora del algoritmo-; y mi C++/GMP es de media 116 veces mas rapido que el clasico, maximo 275 -mejora de implementacion-. Tercero, la memoria: el pico baja a 58 MB, un 55% menos, gracias a liberar nodos. En el caso mayor, pasamos de 866 segundos a menos de 6. El algoritmo mejora al clasico, y C++/GMP mejora claramente a Python, manteniendo la correccion.");

s = pres.addSlide(); header(s,"Resultados y cierre","Datos reales, conclusiones y limitaciones");
const rr=[["54.278","modulos unicos brutos"],["54.275","modulos plausibles"],["0","factores compartidos no triviales"],["0","claves vulnerables"],["~ 23,8 s","tiempo total del analisis"]];
let qy=2.0;
rr.forEach(d=>{ card(s,0.7,qy,4.5,0.86, d[0]==="0"?TINTB:TINT);
  s.addText(d[0],{x:0.9,y:qy+0.1,w:1.85,h:0.62,fontFace:TF,fontSize:21,bold:true,color: d[0]==="0"?BERRY:NAVY,valign:"middle"});
  s.addText(d[1],{x:2.75,y:qy+0.1,w:2.35,h:0.62,fontFace:BF,fontSize:12,color:MUTED,valign:"middle"});
  qy+=0.97; });
s.addText("Conclusion (prudente)",{x:5.5,y:1.95,w:7,h:0.4,fontFace:TF,fontSize:16,bold:true,color:BERRY});
bullets(s,[
  "No se hallaron factores compartidos en este subconjunto...",
  "...pero no permite extrapolar a todos los CT logs ni a todo Internet.",
],5.5,2.4,7.1,1.5,14.5);
s.addText("Limitaciones y trabajo futuro",{x:5.5,y:4.0,w:7,h:0.4,fontFace:TF,fontSize:16,bold:true,color:NAVY});
bullets(s,[
  "Conjunto real acotado (issuer/); parrilla sintetica reducida.",
  "Futuro: mas logs y certificados hoja, ejecucion por lotes, distribucion y mas memoria.",
],5.5,4.45,7.1,1.9,14.5);
footer(s);
s.addNotes("(2:20) Resultados sobre datos reales. De 54.278 modulos brutos, 54.275 plausibles. Al ejecutar el ataque: cero factores compartidos no triviales y cero claves vulnerables, en unos 23,8 segundos. Conviene leerlo con prudencia: no encontrar vulnerabilidades en este subconjunto es un resultado acotado; no permite afirmar nada sobre todos los CT logs ni todo Internet. Limitaciones: conjunto real ceñido a issuer, y parrilla sintetica menor que la del articulo por los recursos de un portatil. Futuro: mas logs y certificados hoja, ejecucion por lotes, distribucion y mas memoria. En conjunto, el TFM aporta una implementacion validada y mas eficiente del Binary Tree Batch GCD y un flujo completo de auditoria sobre CT logs, continuando la linea de Vage y Pelofske. Muchas gracias; quedo a disposicion del tribunal.");

s = pres.addSlide(); s.background={color:NAVY};
s.addShape(pres.shapes.OVAL,{x:1.0,y:3.25,w:0.25,h:0.25,fill:{color:BERRY}});
s.addText("Material de apoyo",{x:1.35,y:3.0,w:10,h:0.8,fontFace:TF,fontSize:34,bold:true,color:WHITE});
s.addText("Diapositivas de respaldo para preguntas del tribunal",{x:1.35,y:3.85,w:10,h:0.5,fontFace:BF,fontSize:16,color:"C8D2E2"});

s = pres.addSlide(); header(s,"Backup","Product/Remainder Tree vs. Binary Tree Batch GCD");
s.addTable([
  [{text:"Aspecto",options:{bold:true,color:WHITE,fill:{color:NAVY},fontFace:BF,fontSize:14}},
   {text:"Clasico (product+remainder)",options:{bold:true,color:WHITE,fill:{color:NAVY},fontFace:BF,fontSize:14}},
   {text:"Binary Tree Batch GCD",options:{bold:true,color:WHITE,fill:{color:NAVY},fontFace:BF,fontSize:14}}],
  ["Estructura","Product tree + remainder tree","Solo arbol binario de productos"],
  ["Remainder tree","Se construye explicitamente","No se construye"],
  ["Acumulacion","Residuos descendentes","GCD en linea -> B = producto de g_j"],
  ["Operaciones gcd","- (via residuos)","2M - 1"],
  ["Complejidad","Mismo orden asintotico","Mismo orden, menor coste practico"],
],{x:0.7,y:2.0,w:11.9,h:3.6,fontFace:BF,fontSize:13.5,color:INK,valign:"middle",
   border:{pt:0.5,color:LINE},rowH:0.6,fill:{color:WHITE},colW:[3.0,4.45,4.45]});
s.addText("Idea central: ambos evitan la comparacion par a par; el binario suprime el remainder tree.",{x:0.7,y:5.9,w:11.9,h:0.5,fontFace:BF,fontSize:13.5,italic:true,color:MUTED,align:"center"});
s.addNotes("Backup. Diferencia esencial: el clasico construye product tree y remainder tree. El binario mantiene solo el arbol de productos y calcula los GCD entre hermanos sobre la marcha, acumulandolos en B; al final hace gcd(Ni,B). Misma complejidad asintotica, pero el binario evita el remainder tree y reduce el coste practico, con 2M-1 operaciones de GCD.");

s = pres.addSlide(); header(s,"Backup","Por que '0 vulnerabilidades' tambien es un resultado?");
bullets(s,[
  "Confirma que el flujo completo funciona de extremo a extremo sobre datos reales.",
  "Aporta evidencia empirica acotada: en este subconjunto no hay factores compartidos.",
  "Es coherente con la teoria: en condiciones normales, compartir un primo es rarisimo.",
  "Acota el alcance: no demuestra ausencia de vulnerabilidades en todos los CT logs.",
  "Define una linea base reproducible para auditar conjuntos mayores en el futuro.",
],0.7,2.0,9.2,4.4,17);
s.addImage(fit("diag_global.png",9.9,1.9,2.8,4.7));
s.addNotes("Backup. Un resultado negativo no es vacio. Valida que toda la cadena -extraccion, normalizacion, deduplicacion y ataque- funciona sobre datos reales. Es evidencia empirica: en este subconjunto no hay factores compartidos, coherente con la teoria, ya que con buena entropia compartir un primo es extraordinariamente improbable. Prudencia: no extrapolamos al total de CT logs. Y deja una linea base reproducible.");

s = pres.addSlide(); header(s,"Backup","Cuanto mejora el algoritmo y cuanto C++/GMP?");
s.addImage(fit("benchmark_speedup_cpp.png",0.7,1.9,7.6,4.6));
card(s,8.6,2.2,4.0,1.7,TINT);
s.addText([{text:"~ 6,1x",options:{fontFace:TF,fontSize:26,bold:true,color:BLUE,breakLine:true}},
  {text:"mejora del ALGORITMO",options:{fontSize:12,bold:true,color:MUTED,breakLine:true}},
  {text:"Binary Tree (Py) vs. clasico (Py)",options:{fontSize:11.5,color:MUTED}}],
  {x:8.8,y:2.35,w:3.7,h:1.5,fontFace:BF});
card(s,8.6,4.1,4.0,1.9,TINTB);
s.addText([{text:"18,7x (max 41,3x)",options:{fontFace:TF,fontSize:21,bold:true,color:BERRY,breakLine:true}},
  {text:"mejora de IMPLEMENTACION",options:{fontSize:12,bold:true,color:MUTED,breakLine:true}},
  {text:"C++/GMP vs. Binary Tree (Py)",options:{fontSize:11.5,color:MUTED,breakLine:true,paraSpaceAfter:3}},
  {text:"Combinado vs. clasico: 116,5x (max 275,3x)",options:{fontSize:11.5,italic:true,color:INK}}],
  {x:8.8,y:4.25,w:3.7,h:1.7,fontFace:BF});
s.addNotes("Backup. Pregunta natural del tribunal. Python vs Python aisla la mejora algoritmica: el binary tree es unas 6,1 veces mas rapido que el clasico. C++ vs binary tree en Python aisla la mejora de implementacion: 18,7 de media, hasta 41. Multiplicando, frente al clasico mi implementacion rinde 116 de media, maximo 275. Parte de la ganancia es del algoritmo de Pelofske y parte, la mayor, del salto a C++/GMP con gestion de memoria.");

s = pres.addSlide(); header(s,"Backup","Que es un 'modulo plausible'?");
bullets(s,[
  "Validacion basica antes del ataque: descartar lo que no puede ser un modulo RSA.",
  "Se descartan modulos pares y los de longitud por debajo del umbral.",
  "De 54.278 brutos -> 54.275 plausibles (3 descartados: 2 pares y 1 demasiado corto).",
  "Mayoria de claves RSA-2048 (53.539); tambien 1024, 3072 y 4096 bits.",
],0.7,2.0,6.5,4.4,16);
s.addImage(fit("distribucion_bits_modulos.png",7.2,2.2,5.4,3.8));
s.addNotes("Backup. Modulo plausible es el que supera una validacion basica antes del ataque: descarto los pares -un modulo RSA es producto de dos primos impares- y los de longitud inferior al umbral. De 54.278 brutos solo cayeron 3: dos pares y uno demasiado corto, quedando 54.275. La distribucion muestra que la mayoria son claves de 2048 bits, con presencia menor de 1024, 3072 y 4096.");

s = pres.addSlide(); header(s,"Backup","Como escalar el trabajo a mas CT logs");
bullets(s,[
  "Incorporar mas logs y los certificados hoja de las entradas completas.",
  "Ejecucion por lotes (batches) y cruce entre bloques, como en el metodo clasico.",
  "Paralelizar las fases aun secuenciales (agregacion de B).",
  "Distribucion y entornos con mas memoria para acercarse a la escala de la literatura.",
  "Automatizacion incremental de descarga, extraccion y auditoria.",
],0.7,2.0,7.8,4.4,16);
s.addImage(fit("chart_escalabilidad.png",8.7,2.1,3.9,4.3));
s.addNotes("Backup. Para escalar: ampliar a mas logs e incluir certificados hoja, no solo issuer; procesar por lotes y cruzarlos, como el clasico, para no agotar memoria; paralelizar las fases aun secuenciales, sobre todo la agregacion de B; usar entornos distribuidos o con mas memoria para acercarnos a los cientos de millones de claves; y automatizar el flujo de forma incremental.");

s = pres.addSlide(); header(s,"Backup","Tabla completa de resultados sinteticos");
const head=[{text:"Bits",options:{bold:true,color:WHITE,fill:{color:NAVY}}},
 {text:"WEAK",options:{bold:true,color:WHITE,fill:{color:NAVY}}},
 {text:"N",options:{bold:true,color:WHITE,fill:{color:NAVY}}},
 {text:"C++/GMP (s)",options:{bold:true,color:WHITE,fill:{color:NAVY}}},
 {text:"Binary Py (s)",options:{bold:true,color:WHITE,fill:{color:NAVY}}},
 {text:"Remainder Py (s)",options:{bold:true,color:WHITE,fill:{color:NAVY}}},
 {text:"Speedup C++",options:{bold:true,color:WHITE,fill:{color:NAVY}}}];
const rows=[
["1024","2","2000","0,196","1,236","9,266","47,3x"],["1024","2","5000","0,501","8,353","55,321","110,4x"],
["1024","2","10000","1,262","32,896","218,123","172,8x"],["1024","100","2000","0,198","1,327","9,012","45,5x"],
["1024","100","5000","0,570","8,815","55,288","97,0x"],["1024","100","10000","1,381","33,721","218,579","158,3x"],
["1024","1000","2000","0,406","2,530","9,001","22,2x"],["1024","1000","5000","0,992","11,834","55,418","55,9x"],
["1024","1000","10000","2,220","39,464","218,174","98,3x"],["2048","2","2000","0,411","4,486","35,272","85,8x"],
["2048","2","5000","1,292","32,790","217,923","168,7x"],["2048","2","10000","3,139","129,501","864,321","275,3x"],
["2048","100","2000","0,465","4,993","35,315","75,9x"],["2048","100","5000","1,429","34,203","218,786","153,1x"],
["2048","100","10000","3,368","132,484","870,017","258,3x"],["2048","1000","2000","0,917","9,201","35,440","38,6x"],
["2048","1000","5000","2,573","44,440","218,372","84,9x"],["2048","1000","10000","5,851","152,803","866,819","148,1x"],
];
const body=rows.map((r,i)=>r.map(c=>({text:c,options:{fill:{color:i%2?"F4F6FA":WHITE},fontSize:10.5}})));
s.addTable([head,...body],{x:0.7,y:1.7,w:11.9,h:5.0,fontFace:BF,fontSize:9,color:INK,
  align:"center",valign:"middle",border:{pt:0.5,color:LINE},colW:[1.1,1.2,1.3,2.3,2.3,2.6,1.1]});
s.addNotes("Backup. Tabla de las 18 configuraciones sinteticas, del CSV de resultados. Por cada combinacion de bits, WEAK y N, los tiempos de las tres implementaciones y el speedup de C++/GMP frente al clasico. El maximo, 275 veces, en 2048 bits, WEAK 2 y N 10.000.");

pres.writeFile({ fileName:"/tmp/presentacion_TFM.pptx" }).then(f=>console.log("OK ->",f));

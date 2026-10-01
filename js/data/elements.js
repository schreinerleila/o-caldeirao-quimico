// Massas atômicas abreviadas; entre colchetes, número de massa do isótopo
// mais estável para elementos sem peso atômico padrão.
const rows = [
  ['H','Hidrogênio','1.008',1,1], ['He','Hélio','4.0026',18,1],
  ['Li','Lítio','6.94',1,2], ['Be','Berílio','9.0122',2,2], ['B','Boro','10.81',13,2], ['C','Carbono','12.011',14,2], ['N','Nitrogênio','14.007',15,2], ['O','Oxigênio','15.999',16,2], ['F','Flúor','18.998',17,2], ['Ne','Neônio','20.180',18,2],
  ['Na','Sódio','22.990',1,3], ['Mg','Magnésio','24.305',2,3], ['Al','Alumínio','26.982',13,3], ['Si','Silício','28.085',14,3], ['P','Fósforo','30.974',15,3], ['S','Enxofre','32.06',16,3], ['Cl','Cloro','35.45',17,3], ['Ar','Argônio','39.948',18,3],
  ['K','Potássio','39.098',1,4], ['Ca','Cálcio','40.078',2,4], ['Sc','Escândio','44.956',3,4], ['Ti','Titânio','47.867',4,4], ['V','Vanádio','50.942',5,4], ['Cr','Cromo','51.996',6,4], ['Mn','Manganês','54.938',7,4], ['Fe','Ferro','55.845',8,4], ['Co','Cobalto','58.933',9,4], ['Ni','Níquel','58.693',10,4], ['Cu','Cobre','63.546',11,4], ['Zn','Zinco','65.38',12,4], ['Ga','Gálio','69.723',13,4], ['Ge','Germânio','72.630',14,4], ['As','Arsênio','74.922',15,4], ['Se','Selênio','78.971',16,4], ['Br','Bromo','79.904',17,4], ['Kr','Criptônio','83.798',18,4],
  ['Rb','Rubídio','85.468',1,5], ['Sr','Estrôncio','87.62',2,5], ['Y','Ítrio','88.906',3,5], ['Zr','Zircônio','91.224',4,5], ['Nb','Nióbio','92.906',5,5], ['Mo','Molibdênio','95.95',6,5], ['Tc','Tecnécio','[98]',7,5], ['Ru','Rutênio','101.07',8,5], ['Rh','Ródio','102.91',9,5], ['Pd','Paládio','106.42',10,5], ['Ag','Prata','107.87',11,5], ['Cd','Cádmio','112.41',12,5], ['In','Índio','114.82',13,5], ['Sn','Estanho','118.71',14,5], ['Sb','Antimônio','121.76',15,5], ['Te','Telúrio','127.60',16,5], ['I','Iodo','126.90',17,5], ['Xe','Xenônio','131.29',18,5],
  ['Cs','Césio','132.91',1,6], ['Ba','Bário','137.33',2,6], ['La','Lantânio','138.91',3,6], ['Ce','Cério','140.12',4,6], ['Pr','Praseodímio','140.91',5,6], ['Nd','Neodímio','144.24',6,6], ['Pm','Promécio','[145]',7,6], ['Sm','Samário','150.36',8,6], ['Eu','Európio','151.96',9,6], ['Gd','Gadolínio','157.25',10,6], ['Tb','Térbio','158.93',11,6], ['Dy','Disprósio','162.50',12,6], ['Ho','Hólmio','164.93',13,6], ['Er','Érbio','167.26',14,6], ['Tm','Túlio','168.93',15,6], ['Yb','Itérbio','173.05',16,6], ['Lu','Lutécio','174.97',17,6], ['Hf','Háfnio','178.49',4,6], ['Ta','Tântalo','180.95',5,6], ['W','Tungstênio','183.84',6,6], ['Re','Rênio','186.21',7,6], ['Os','Ósmio','190.23',8,6], ['Ir','Irídio','192.22',9,6], ['Pt','Platina','195.08',10,6], ['Au','Ouro','196.97',11,6], ['Hg','Mercúrio','200.59',12,6], ['Tl','Tálio','204.38',13,6], ['Pb','Chumbo','207.2',14,6], ['Bi','Bismuto','208.98',15,6], ['Po','Polônio','[209]',16,6], ['At','Astato','[210]',17,6], ['Rn','Radônio','[222]',18,6],
  ['Fr','Frâncio','[223]',1,7], ['Ra','Rádio','[226]',2,7], ['Ac','Actínio','[227]',3,7], ['Th','Tório','232.04',4,7], ['Pa','Protactínio','231.04',5,7], ['U','Urânio','238.03',6,7], ['Np','Netúnio','[237]',7,7], ['Pu','Plutônio','[244]',8,7], ['Am','Amerício','[243]',9,7], ['Cm','Cúrio','[247]',10,7], ['Bk','Berquélio','[247]',11,7], ['Cf','Califórnio','[251]',12,7], ['Es','Einstênio','[252]',13,7], ['Fm','Férmio','[257]',14,7], ['Md','Mendelévio','[258]',15,7], ['No','Nobélio','[259]',16,7], ['Lr','Laurêncio','[266]',17,7], ['Rf','Rutherfórdio','[267]',4,7], ['Db','Dúbnio','[268]',5,7], ['Sg','Seabórgio','[269]',6,7], ['Bh','Bóhrio','[270]',7,7], ['Hs','Hássio','[277]',8,7], ['Mt','Meitnério','[278]',9,7], ['Ds','Darmstádtio','[281]',10,7], ['Rg','Roentgênio','[282]',11,7], ['Cn','Copernício','[285]',12,7], ['Nh','Nihônio','[286]',13,7], ['Fl','Fleróvio','[289]',14,7], ['Mc','Moscóvio','[290]',15,7], ['Lv','Livermório','[293]',16,7], ['Ts','Tenessino','[294]',17,7], ['Og','Oganessônio','[294]',18,7]
];

const lanthanoids = new Set('La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu'.split(' '));
const actinoids = new Set('Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr'.split(' '));
const familyFor = (symbol, group) => {
  if (symbol === 'H') return 'ametais';
  if (lanthanoids.has(symbol)) return 'lantanoides';
  if (actinoids.has(symbol)) return 'actinoides';
  if (group === 1) return 'alcalinos';
  if (group === 2) return 'alcalino-terrosos';
  if (group >= 3 && group <= 12) return 'transicao';
  if (group === 13) return 'familia-do-boro';
  if (group === 14) return 'carbono';
  if (group === 15) return 'nitrogenio';
  if (group === 16) return 'calcogenios';
  if (group === 17) return 'halogenios';
  if (group === 18) return 'nobres';
  return 'ametais';
};

export const elements = rows.map(([symbol, name, mass, group, period], index) => ({
  symbol, name: name.trim(), number: index + 1, group: lanthanoids.has(symbol) || actinoids.has(symbol) ? 3 : group, period, mass,
  family: familyFor(symbol, group),
  row: lanthanoids.has(symbol) ? 8 : actinoids.has(symbol) ? 9 : period,
  column: lanthanoids.has(symbol) ? index + 1 - 54 : actinoids.has(symbol) ? index + 1 - 86 : group
}));

export const familyNames = {
  nobres:'Gases nobres', transicao:'Metais de transição', alcalinos:'Metais alcalinos',
  calcogenios:'Calcogênios', halogenios:'Halogênios', carbono:'Família do carbono',
  ametais:'Ametais', 'alcalino-terrosos':'Metais alcalino-terrosos',
  'familia-do-boro':'Família do boro', nitrogenio:'Família do nitrogênio',
  lantanoides:'Lantanóides', actinoides:'Actinóides'
};
export const bySymbol = Object.fromEntries(elements.map(e => [e.symbol, e]));

export const elements = [
  ['H','Hidrogênio',1,'1','1.008','ametais'], ['He','Hélio',2,'18','4.003','nobres'],
  ['Li','Lítio',3,'1','6.94','alcalinos'], ['C','Carbono',6,'14','12.011','carbono'], ['N','Nitrogênio',7,'15','14.007','ametais'], ['O','Oxigênio',8,'16','15.999','calcogenios'], ['F','Flúor',9,'17','18.998','halogenios'], ['Ne','Neônio',10,'18','20.180','nobres'],
  ['Na','Sódio',11,'1','22.990','alcalinos'], ['Si','Silício',14,'14','28.085','carbono'], ['P','Fósforo',15,'15','30.974','ametais'], ['S','Enxofre',16,'16','32.06','calcogenios'], ['Cl','Cloro',17,'17','35.45','halogenios'], ['Ar','Argônio',18,'18','39.948','nobres'],
  ['K','Potássio',19,'1','39.098','alcalinos'], ['Ca','Cálcio',20,'2','40.078','alcalino-terrosos'], ['Fe','Ferro',26,'8','55.845','transicao'], ['Cu','Cobre',29,'11','63.546','transicao'], ['Se','Selênio',34,'16','78.971','calcogenios'], ['Br','Bromo',35,'17','79.904','halogenios'], ['Ag','Prata',47,'11','107.868','transicao'], ['I','Iodo',53,'17','126.904','halogenios'], ['Au','Ouro',79,'11','196.967','transicao'], ['Pb','Chumbo',82,'14','207.2','carbono']
].map(([symbol,name,number,group,mass,family]) => ({ symbol,name,number,group,mass,family }));

export const familyNames = { nobres:'Gases nobres', transicao:'Metais de transição', alcalinos:'Metais alcalinos', calcogenios:'Calcogênios', halogenios:'Halogênios', carbono:'Família do carbono', ametais:'Ametais', 'alcalino-terrosos':'Alcalino-terrosos' };
export const bySymbol = Object.fromEntries(elements.map(e => [e.symbol, e]));



let sorteraPopularitet = (sorteraEfterDatumFallande, sorteraEfterDatumStegrande ,sorteraRelevans) => {
    let valdSortering;
    if (sorteraEfterDatumFallande.checked) {
         valdSortering=`&sort`;
    } else if (sorteraEfterDatumStegrande.checked) {
     valdSortering=`&sort=date-posted-asc`;
    } else if (sorteraRelevans.checked) {
        valdSortering=`&sort=relevance`;
       };
    return valdSortering;
};

let sorteraType = (contentTypeFoton, contentTypeScreenshots, contentTypeOther) => {
    let valdType;
    let valdTypeArray = [{type: contentTypeFoton.id, value:1, checked: contentTypeFoton.checked}, {type: contentTypeScreenshots.id, value:2, checked: contentTypeScreenshots.checked}, {type: contentTypeOther.id, value:3, checked: contentTypeOther.checked}];
    valdTypeArray = valdTypeArray.filter(val => val.checked);
        if (valdTypeArray.length == 3) {
            valdType = 7;
        } else if (valdTypeArray.length==1) {
            valdType = valdTypeArray[0].value;
        } else if (valdTypeArray.length==2&&valdTypeArray[0].value + valdTypeArray[1].value == 3) {
            valdType = 4;
        }else if (valdTypeArray.length==2&&valdTypeArray[0].value + valdTypeArray[1].value == 5) {
            valdType = 5;
        } else if (valdTypeArray.length==2&&valdTypeArray[0].value + valdTypeArray[1].value == 4) {
            valdType = 6;
        };
    return valdType;
};

let sorteraDatum = (uploadDateVecka, uploadDateMånad, uploadDateÅr) => {
    let valdUploadDate; 
    let dagensDatum = new Date();
       let enVeckaSedan = new Date();
       enVeckaSedan.setDate(dagensDatum.getDate() - 7);
       let enMånadSedan = new Date();
       enMånadSedan.setDate(enMånadSedan.getDate()-30)
       let ettÅrSedan = new Date();
       ettÅrSedan.setFullYear(ettÅrSedan.getFullYear()-1)

       let valdaDatumArray = [{type: uploadDateVecka.id, value: enVeckaSedan, checked: uploadDateVecka.checked}, {type: uploadDateMånad.id, value: enMånadSedan, checked: uploadDateMånad.checked}, {type: uploadDateÅr.id, value: ettÅrSedan, checked: uploadDateÅr.checked}];
       valdaDatumArray = valdaDatumArray.filter(val => val.checked);
       valdaDatumArray = valdaDatumArray.map(datum => datum.value.getTime()).sort();
       if (valdaDatumArray[0]) { 
       valdUploadDate = valdaDatumArray[0].toString().split('').slice(0, 10).join('');
       };
    return valdUploadDate;
};


let sorteraMiljö = (geoContextInomhus, geoContextUtomhus) => {
    let valdGeoContext;
    if (geoContextInomhus.checked&&!geoContextUtomhus.checked) {
        valdGeoContext=1;
    } else if (!geoContextInomhus.checked&&geoContextUtomhus.checked) {
        valdGeoContext=2;
    }
    return valdGeoContext;
};



export {sorteraPopularitet, sorteraType, sorteraDatum, sorteraMiljö};
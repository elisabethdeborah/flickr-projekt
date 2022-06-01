
const sorteraEfterDatumFallande = document.getElementById('filter-date-descending');
const sorteraEfterDatumStegrande = document.getElementById('filter-date-ascending');
const sorteraRelevans =document.getElementById('filter-relevance');


const contentTypeFoton = document.getElementById('content-type-photos');
const contentTypeScreenshots = document.getElementById('content-type-screenshots');
const contentTypeOther = document.getElementById('content-type-other');


const uploadDateVecka = document.getElementById('upload-date-week');
const uploadDateMånad = document.getElementById('upload-date-month');
const uploadDateÅr = document.getElementById('upload-date-year');

const geoContextInomhus = document.getElementById('geo-context-indoors');
const geoContextUtomhus = document.getElementById('geo-context-outdoors');


//FILTER FUNCTIONS
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


//PREVENT DEFAULT VID KLICK PÅ SUBMIT SÅ ATT SIDAN INTE LADDAS OM 
const form = document.querySelector('form');
form.addEventListener('submit', e => {
    e.preventDefault();
}); 


let valdGeoContext;
let valdType;
let valdUploadDate;
let valdSortering;


const body = document.querySelector('body');
const url = 'https://api.flickr.com/services/rest?';
const api_key = '05514a01aa594621c9a12a8d8915fb95';

let methodSearch = 'flickr.photos.search';
let methodGetCommentsList = 'flickr.photos.comments.getList';
let methodGetBildInfo = 'flickr.photos.getInfo';

let antalBilderPerPage;
let perPage; 
let pageNumber;

const val10 = document.getElementById('number-of-images-per-page-10');
const val25 = document.getElementById('number-of-images-per-page-25');
const val50 =document.getElementById('number-of-images-per-page-50');
const queryInput = document.getElementById('query');
let doldQuery;

const searchButton = document.getElementById('search-button');
const filtreraLänk = document.getElementById('filter-link');
const filterSektion = document.querySelector('.filter-buttons');
const filterSektionChildren = document.querySelectorAll('.filter-buttons>*');
const filterSektionGrandChildren = document.querySelectorAll('.filter-buttons>*>*');




const main = document.querySelector('main');
const mainChildren = document.querySelectorAll('main>*');
const mainGrandChildren = document.querySelectorAll('main>*>*');
const header = document.querySelector('.header');

const resultatSection = document.querySelector('.result');
const resultatRubrik = document.querySelector('.result>h2');
const resultatChildren = document.querySelectorAll('.result>*'); 

const bildLista = document.getElementById('image-list');
const moveOnAside = document.querySelector('.move-on');
let bildStorlek;
let bilderAttVisa;
let klickMätare;

//LÄGGER PÅ DISPLAY-NONE CLASS PÅ ALLA FILTERELEMENT OCH TOMMA MAIN-ELEMENT NÄR FILTER-ALTERNATIVEN ÄR DOLDA
filterSektionChildren.forEach((child) => child.classList.add('display-none'));
filterSektionGrandChildren.forEach((child) => child.classList.add('display-none'));
mainChildren.forEach((child) => child.classList.add('display-none'));
resultatChildren.forEach((child) => child.classList.add('display-none'));
//resultsGrandChildren.forEach((child) => child.classList.add('display-none'));


//FETCHAR BILDERNA

const getPictures = async (query, klickMätare, valdGeoContext, valdType, valdUploadDate, valdSortering) => {

    let färdigFetchUrl;
   
    // ANTAL BILDER SOM SKA VISAS PÅ VARJE "SIDA", VÄRDE HÄMTAT FRÅN RADIO-BUTTON-INPUT, (DEFAULT ÄR 25 ST), FORMATERAS SOM ULR. 
    perPage = `per_page=${antalBilderPerPage}`;
    // VILKEN SIDA SOM SKA VISAS, VÄRDE FRÅN ANTAL KLICK PÅ NÄSTA/FÖREGÅENDE-KNAPPAR, ANNARS SIDA 1, FORMATERAS SOM ULR.
    pageNumber = `page=${klickMätare}`;
    //FETCH-URL SOM SÄTTS IHOP BEROENDE PÅ VILKEN METHOD (HÄR SEARCH-METHOD), SÖKTEXT OCH ANTAL-BILDER-VAL OCH VILKEN SIDA SOM SKA VISAS. 
   let grundFetchUrl =`${url}api_key=${api_key}&method=${methodSearch}&text=${query}&format=json&nojsoncallback=1&${perPage}&${pageNumber}`;
  

    let filterValsArray = [
        {url: `&content_type=${valdType}`, val: valdType},
        {url: `&geo_context=${valdGeoContext}`, val: valdGeoContext},
        {url: `${valdSortering}`, val: valdSortering},
        {url: `max_upload_date=${valdUploadDate}`, val: valdUploadDate}
    ];

    let valVärde = (val) => {
        if (val.val) {
            return val;
        }
    }
    
    //FETCH-URL-PÅBYGGNAD MED EXTRA-VAL FRÅN FILTERSEKTIONEN, HÄMTADE FRÅN FILTERVALSARRAY:EN
    filterValsArray = filterValsArray.filter(valVärde);
    filterValsArray=filterValsArray.map((val) => val.url).join('');

    //HELA FETCH-URL:EN
    färdigFetchUrl=grundFetchUrl+filterValsArray;

    // FETCH-ANROP MED FETCH-URL:EN SOM ARGUMENT
    const response = await fetch(färdigFetchUrl);
    const data = await response.json();
    bilderAttVisa = data.photos.photo; 

    let aktuellSida = data.photos.page;
    let sistaBildPåAktuellSida = aktuellSida*antalBilderPerPage;
    let förstaBildPåAktuellSida = sistaBildPåAktuellSida-antalBilderPerPage+1;
    let totaltAntalBilder = data.photos.total;
    if (window.innerWidth>500) {
        bildStorlek = 'q'; 
    } else {
        bildStorlek = 'n'
    }
    
    bilderAttVisa.forEach((bildObjekt) => {
        createPhotoUrl(bildObjekt, bildStorlek);
        getBildInfo(bildObjekt.id)
    }); 
    //KALLAR PÅ FUNKTION FÖR ATT VISA INFO OM AKTUELL SIDA ETC + SKAPA FRAMÅT/BAKÅT-KNAPPAR UNDER BILDERNA PÅ SIDAN

    resultatsNavigering(förstaBildPåAktuellSida, sistaBildPåAktuellSida, totaltAntalBilder, aktuellSida); 
};



//VISA INFO OM AKTUELL SIDA ETC + SKAPA FRAMÅT/BAKÅT-KNAPPAR UNDER BILDERNA PÅ SIDAN
let resultatsNavigering = (förstaBildPåAktuellSida, sistaBildPåAktuellSida, totaltAntalBilder, aktuellSida) => {

    let nästaSection = document.getElementById('nästa-section');
    let nästaSidaKnapp = document.getElementById('nästa-sida-knapp');
    let föregåendeSidaKnapp = document.getElementById('föregående-sida-knapp');
    let pageKnappar = document.querySelector('.page-knappar-container');
    let infoSiffror = document.querySelector('#nästa-section>p');
    if (!nästaSection) {  
        let nästaSection = document.createElement('section');
        nästaSection.setAttribute('id', 'nästa-section');

        let pageKnappar = document.createElement('aside');
        pageKnappar.setAttribute('class', 'page-knappar-container');

        let nästaSidaKnapp = document.createElement('button');
        
        nästaSidaKnapp.textContent = 'Nästa';
       
        nästaSidaKnapp.setAttribute('id', 'nästa-sida-knapp');

        let infoSiffror = document.createElement('p');
        let infoSiffrorText = document.createTextNode(`Visar bild ${förstaBildPåAktuellSida} - ${sistaBildPåAktuellSida} (totalt ${formateraTotaltAntalBilder(totaltAntalBilder)} st)`);
        infoSiffror.appendChild(infoSiffrorText);
        nästaSection.appendChild(infoSiffror);
        pageKnappar.appendChild(nästaSidaKnapp);
        nästaSection.appendChild(pageKnappar);
        moveOnAside.appendChild(nästaSection);
         
        nästaSidaKnapp.addEventListener('click', () => {
            omstart('plus');
        });  
    } else {
        infoSiffror.innerHTML= `Visar bild ${förstaBildPåAktuellSida} - bild ${sistaBildPåAktuellSida} (totalt ${formateraTotaltAntalBilder(totaltAntalBilder)} st)`;
    };

    if (aktuellSida>1 &&nästaSection&&!föregåendeSidaKnapp) {
       
        let föregåendeSidaKnapp = document.createElement('button');
        föregåendeSidaKnapp.textContent = 'Förra';
        föregåendeSidaKnapp.setAttribute('id', 'föregående-sida-knapp');
        pageKnappar.insertBefore(föregåendeSidaKnapp, nästaSidaKnapp);
         föregåendeSidaKnapp.addEventListener('click', () => {
            omstart('minus');
        }); 
    }
};

// FIXAR TILL SIFFRAN TOTALT ANTAL BILDER SÅ ATT DET BLIR LÄTTARE ATT LÄSA
let formateraTotaltAntalBilder = (totaltAntalBilder) => {
   totaltAntalBilder=totaltAntalBilder.toString().split('');
    let indexStart=totaltAntalBilder.length%3;
   let i;
   let antalVarv = totaltAntalBilder.length-indexStart;
   for (i = 0; i < antalVarv; i++) {
        if (i%3 == 0) {
            if (i==0){
                totaltAntalBilder.splice(indexStart, 0, ' ')
            } else {
                totaltAntalBilder.reverse().splice(i, 0, ' ')
                totaltAntalBilder.reverse()
            } 
        }
   }
   totaltAntalBilder=totaltAntalBilder.join('');
   return totaltAntalBilder;
}

//NÄSTA SIDA, GÖR NYTT FETCH-ANROP MED NY SIDA-ARGUMENT
let omstart = (klickMätning) => {
    if (document.getElementById('nästa-section')) {
            if (klickMätning == 'plus') {
                klickMätare++;
            } else if (klickMätning == 'minus') {
                klickMätare--;
            }
        bildLista.innerHTML='';
        getPictures(doldQuery, klickMätare, valdGeoContext, valdType, valdUploadDate, valdSortering); 
    } 
};

//SÄTTER IHOP HÄMTADE OBJEKTETS DELAR TILL FOTOTS URL OCH KALLAR PÅ CREATEPHOTOELEMENT MED OBJEKTET OCH STORLEK SOM ARGUMENT
const createPhotoUrl = (bildObjekt, bildStorlek) => {                   
    let startUrl = 'https://live.staticflickr.com';
    let serverId = bildObjekt.server;
    let bildId = bildObjekt.id;
    let secret = bildObjekt.secret;
    let bildText = bildObjekt.title;
    let storlek = bildStorlek;
    let bildUrl = `${startUrl}/${serverId}/${bildId}_${secret}_${storlek}.jpg`;
    createPhotoElement(bildObjekt, bildUrl, bildText, storlek);
};

//SKAPAR FOTO-FIGURE MED IMG-ELEMENT DÄR SRC ÄR DEN TIDIGARE SKAPADE URL:EN
const createPhotoElement = (bildObjekt, bildUrl, bildText, storlek) => {
    let figure = document.createElement('figure');
    let bildElement = document.createElement('img');
    bildElement.setAttribute('src', bildUrl);
    let caption = document.createElement('figcaption');
    caption.textContent = `${bildText}`;

    figure.appendChild(bildElement);
    figure.appendChild(caption);
    getComments(bildObjekt.id, figure); 

    //SÄTTER DEN NYA FIGURE:S ID TILL BILDOBJEKTETS ID FRÅN API:N
    figure.setAttribute('id', bildObjekt.id)
    //SKICKAR FIGURE, BILDOBJEKT FRÅN API, OCH SJÄLVA IMG-ELEMENTET TILL DISPLAY
    displayFigures(bildObjekt, figure, bildElement, storlek);
};


//HUR DEN FÄRDIGBYGGDA FIGURE:N VISAS PÅ SIDAN

const displayFigures  = (bildObjekt, figure, bildElement) => {
            
    //KLICK-EVENT MED FUNKTION SOM FÖRSTORAR / FÖRMINSKAR KLICKAD BILD GENOM ATT ÄNDRA STORLEKEN I BILD-URL:EN
    if (window.innerWidth>650) {
        figure.firstElementChild.addEventListener('click', (event) => {   //IMG-ELEMENT
            figure.classList.add('klickad-bild');
        
            event.target.setAttribute('class', 'förstorat-foto')
            let klickadBildBakgrund = document.createElement('article');
            if (figure.classList.contains('klickad-bild')&&figure.firstElementChild.id!='delete-knapp') {
                let deleteKnapp = document.createElement('button');
                deleteKnapp.innerText ='X';
                deleteKnapp.setAttribute('id', 'delete-knapp')
                figure.insertBefore(deleteKnapp, figure.firstElementChild);
                //OM BILDEN SKA FÖRMINSKAS 
                deleteKnapp.addEventListener('click', event => {
                    //OM KOMMENTARFÄLTET INTE ÄR UPPE
                    if (!figure.classList.contains('visar-comments')) {
                    //OM KOMMENTARER INTE SKA VISAS 
                        let startUrl = 'https://live.staticflickr.com';
                        let serverId = bildObjekt.server;
                        let bildId = bildObjekt.id;
                        let secret = bildObjekt.secret;
                        let storlek = 'q'; 
                        let bildUrl = `${startUrl}/${serverId}/${bildId}_${secret}_${storlek}.jpg`;
                        bildElement.setAttribute('src', bildUrl);
                        figure.children[2].removeAttribute('class') //TAR BORT 'FÖRSTORAT-FOTO'-CLASS PÅ IMG
                        
                        figure.classList.remove('visar-comments');
                        figure.classList.remove('klickad-bild')
                    
                        bildLista.removeChild(klickadBildBakgrund);
                        figure.removeChild(event.target);
                    }
                    else {
                        //MEDDELANDE: TA BORT KOMMENTARERNA FÖRE DELETE
                        deleteKnapp.innerText = 'klicka bort kommentarer';
                        deleteKnapp.style.borderRadius = '10px';
                        setTimeout(() => {
                            deleteKnapp.innerText = 'X';
                            deleteKnapp.style.borderRadius = '100%';
                        }, 3000);
                        
                    }
                }) 
                //OM BILDEN SKA FÖRSTORAD
                let startUrl = 'https://live.staticflickr.com';
                let serverId = bildObjekt.server;
                let bildId = bildObjekt.id;
                let secret = bildObjekt.secret;
                let storlek = 'c';
                let bildUrl = `${startUrl}/${serverId}/${bildId}_${secret}_${storlek}.jpg`;
                bildElement.setAttribute('src', bildUrl);
                klickadBildBakgrund.setAttribute('class', 'klickad-bild-bakgrund');
                bildLista.appendChild(klickadBildBakgrund);
            }                                    
        });
    };
   // LÄGGER IN I BILD-LISTA-ELEMENTET I HTML:EN
     bildLista.appendChild(figure);
     //SKAPAR INFO-KNAPP MED INFO FRÅN API:N
    getBildInfo(bildObjekt.id, figure)
};


//SÖKKNAPPEN, STARTAR ALLT

searchButton.addEventListener('click', () => {
    bildLista.innerHTML='';
     klickMätare=1;
    //SÄTTER ANTAL BILDER SOM SKA VISAS BEROENDE PÅ VILKEN RADIO-BUTTON SOM ÄR VALD. DEFAULT ÄR 25 ST
        if (val10.checked) {
            antalBilderPerPage = 10;
        } else  if (val25.checked) {
            antalBilderPerPage = 25; 
        } else if (val50.checked) {
            antalBilderPerPage = 50; 
        } 
        moveOnAside.innerHTML = '';
        bildLista.innerHTML = '';
    let query = queryInput.value;
     doldQuery = query;
     //OM SÖKTEXT HAR ANGETTS:
    if (query!='') {
        //GÖR MAIN-DELEN SYNLIG
        mainChildren.forEach((child) => child.classList.remove('display-none'))
        filterSektion.classList.remove('hide-filter-alternative');
        resultatChildren.forEach((child) => child.classList.remove('display-none'))
        setTimeout(() => {
            main.classList.remove('start-dold');
        }, 100);
        setTimeout(() => {
            body.classList.add('visa-sökning');
        }, 1000);

        resultatRubrik.innerHTML = `Sökresultat för "${query}":`;
        //SÄTTER FILTER-VAL TILL RETURNS EFTER ATT HA KALLAT PÅ FILTER-VALENS FUNKTIONER
         valdGeoContext = sorteraMiljö(geoContextInomhus, geoContextUtomhus);
         valdType = sorteraType(contentTypeFoton, contentTypeScreenshots, contentTypeOther);
         valdUploadDate = sorteraDatum(uploadDateVecka, uploadDateMånad, uploadDateÅr);
         valdSortering = sorteraPopularitet(sorteraEfterDatumFallande, sorteraEfterDatumStegrande ,sorteraRelevans);
        //DÖLJER FILTERSEKTIONEN EFTER SÖKNING
        filterSektion.classList.add('hide-filter-alternative');
        filterSektion.classList.add('display-none');
        //SÖKKNAPPEN KALLAR PÅ GETPICTURES-FUNKTIONEN MED SÖKTEXT SOM ARGUMENT 
        getPictures(query, klickMätare, valdGeoContext, valdType, valdUploadDate, valdSortering);
    };
    //EFTER 1 SEKUND FÖRSVINNER QUERY-INPUT-VALUE, SÅ ATT SÖK-TEXTEN INTE STÅR KVAR I INPUT-FÄLTET, KAN FYLLA I NY SÖK-TEXT UTAN ATT BEHÖVA RADERA
    setTimeout(() => {
        queryInput.value = '';
    }, 1000);
});


//FOTO-KOMMENTARER

//FETCHAR FOTOTS KOMMENTARER FRÅN FLICKR:S API. OM INGA KOMMENTARER FINNS SÄTTS ANTALET TILL 0
const getComments = async (photoID, figure) => { 

    const response = await fetch(`https://api.flickr.com/services/rest?api_key=${api_key}&method=${methodGetCommentsList}&photo_id=${photoID}&format=json&nojsoncallback=1`);
    const data = await response.json();

    let antalKommentarer;
    let kommentarerFörDennaBild = data.comments.comment;

    //OM DET FINNS KOMMENTARER PÅ BILDEN:
    if (kommentarerFörDennaBild!= undefined) {
        antalKommentarer = kommentarerFörDennaBild.length;
        //SKAPAR VISA-KNAPP
        let viewCommentsButton = document.createElement('button');
        viewCommentsButton.innerText=`${antalKommentarer} kommentarer`;
        viewCommentsButton.setAttribute('class', 'view-comments-knapp');
        figure.appendChild(viewCommentsButton);
        //LÄGGER PÅ KLICK-EVENT PÅ VISA-KNAPP SOM KALLAR PÅ SHOW-COMMENTS-FUNKTIONEN
        viewCommentsButton.addEventListener('click', event => {
            showComments(kommentarerFörDennaBild,figure);
            if (event.target.innerText==`${antalKommentarer} kommentarer`) {
                event.target.innerText='Dölj kommentarer';
            } else if (event.target.innerText=='Dölj kommentarer') {
                event.target.innerText=`${antalKommentarer} kommentarer`;
            };
        });
    } else {
        antalKommentarer = 0;
        let noCommentsButton = document.createElement('button');
          noCommentsButton.innerText=`${antalKommentarer} kommentarer`;
          noCommentsButton.setAttribute('class', 'no-comments-knapp');
          figure.appendChild(noCommentsButton);  
    };
};

  //SKAPAR/TAR BORT FIGURE-ELEMENT SOM VISAR KOMMENTARER+VEM SOM SKRIVIT DEM
const showComments = (kommentarerFörDennaBild,figure) => {
    let bildBredd;
    if (window.innerWidth<650) {
        bildBredd = '90vw'
    } else {
        bildBredd = `${figure.children[2].offsetWidth}px`;
    }
    if (!figure.classList.contains('visar-comments')) {
        let kommentarsfält = document.createElement('section');
        kommentarsfält.setAttribute('class', 'kommentarsfält');
        kommentarerFörDennaBild.forEach((kommentar) => {
            let kommentarArticle = document.createElement('article');
            kommentarArticle.setAttribute('class', 'kommentarArticle');
            let authorName = document.createElement('h4');
            authorName.innerHTML = `${kommentar.authorname}: `
            let kommentarElement = document.createElement('p');
            kommentarElement.innerHTML = `"${kommentar._content}"`;
            kommentarsfält.setAttribute('style', `min-width: ${bildBredd}`);
            kommentarArticle.appendChild(authorName);
            kommentarElement.setAttribute('class', 'kommentar');
            kommentarArticle.appendChild(kommentarElement);
            kommentarsfält.appendChild(kommentarArticle);
            figure.appendChild(kommentarsfält)
            figure.classList.add('visar-comments');
        });
    } else {
        document.querySelectorAll('.kommentar').forEach(kommentar => kommentar.remove());
        document.querySelectorAll('.kommentarsfält').forEach(kommentarsfält => kommentarsfält.remove());
        figure.classList.remove('visar-comments');
    }   
}; 


//KLICK-EVENT FÖR ATT VISA FILTRERINGSALTERNATIV 

filtreraLänk.addEventListener('click', event => {

    if (!body.classList.contains('.visa-sökning')) {

        if (filterSektion.classList.contains('hide-filter-alternative')) {
            header.classList.add('halv-header');
            filterSektion.classList.remove('display-none')
            filterSektionChildren.forEach((child) => child.classList.remove('display-none'))
            filterSektionGrandChildren.forEach((child) => child.classList.remove('display-none'))
            setTimeout(() => {
                filterSektion.classList.remove('hide-filter-alternative')
                main.classList.remove('start-dold')
            }, 250);
        } else if (!filterSektion.classList.contains('hide-filter-alternative')) {
            header.classList.remove('halv-header');
            setTimeout(() => {
            filterSektion.classList.add('hide-filter-alternative');
                filterSektion.classList.add('display-none');
                filterSektionChildren.forEach((child) => child.classList.add('display-none'));
                filterSektionGrandChildren.forEach((child) => child.classList.add('display-none'));
            }, 1000);
        }

    } else if (body.classList.contains('.visa-sökning')) {
        
        if (filterSektion.classList.contains('hide-filter-alternative')) {
            filterSektion.classList.remove('display-none')
            filterSektionChildren.forEach((child) => child.classList.remove('display-none'))
            filterSektionGrandChildren.forEach((child) => child.classList.remove('display-none'))
            setTimeout(() => {
                filterSektion.classList.remove('hide-filter-alternative')
            }, 250);
        } else if (!filterSektion.classList.contains('hide-filter-alternative')) {
            filterSektion.classList.add('hide-filter-alternative')        
            setTimeout(() => {
                filterSektion.classList.add('display-none')
                filterSektionChildren.forEach((child) => child.classList.add('display-none'))
                filterSektionGrandChildren.forEach((child) => child.classList.add('display-none'))
            }, 500);
        }
    }
}); 

//FETCHAR FOTOTS KOMMENTARER FRÅN FLICKR:S API. OM INGA KOMMENTARER FINNS SÄTTS ANTALET TILL 0
const getBildInfo = async (photoID, figure) => { 
    const response = await fetch(`${url}api_key=${api_key}&method=${methodGetBildInfo}&photo_id=${photoID}&format=json&nojsoncallback=1`);

    const data = await response.json();
    let dateUpLoaded = data.photo.dateuploaded;
    let antalViews = data.photo.views;

    antalViews = formateraTotaltAntalBilder(antalViews);

     dateUpLoaded = new Date(dateUpLoaded*1000);
    dateUpLoaded = dateUpLoaded.toLocaleDateString();
    dateUpLoaded.split('').slice(1, 4).join('');
    
    if (figure) { 
       let infoKnapp = document.createElement('button');
        infoKnapp.innerText = 'i';
        infoKnapp.setAttribute('id', 'info-knapp');
        figure.insertBefore(infoKnapp, figure.children[0]);
        infoKnapp.addEventListener('click', event => {
            infoKnapp.classList.toggle('visa-info');
            if (infoKnapp.classList.contains('visa-info')) {
                let infoRuta = document.createElement('aside');
                infoRuta.setAttribute('id', 'info-ruta');
                let infoRutaParagraf1 = document.createElement('p');
                let infoRutaParagraf2 = document.createElement('p');
                let infoRutaParagraf3 = document.createElement('p');
                let infoRutaViewsText = document.createTextNode(`Antal visningar: `);
                let infoRutaViewsSiffror = document.createTextNode(`${antalViews}`);
                let infoRutaDatum = document.createTextNode(`Datum : ${dateUpLoaded}`);
                infoRutaParagraf1.appendChild(infoRutaDatum);
                infoRutaParagraf2.appendChild(infoRutaViewsText);
                infoRutaParagraf3.appendChild(infoRutaViewsSiffror);
                infoRuta.appendChild(infoRutaParagraf1);
                infoRuta.appendChild(infoRutaParagraf2);
                infoRuta.appendChild(infoRutaParagraf3);
                figure.appendChild(infoRuta);
                
            } else if (!infoKnapp.classList.contains('visa-info')) {
                figure.removeChild(figure.lastElementChild);
            } 
        })
    }
};























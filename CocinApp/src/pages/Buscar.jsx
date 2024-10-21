import { useEffect, useState, React } from 'react';
import { useParams } from 'react-router-dom';
import './css/search-page.css';

const Buscar = () => {
    const [query, setQuery] = useState('');

  useEffect(() => {
    const metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    metaDescription.content = "Pagina buscar de CocinApp, donde puedes encontrar recetas."
    document.getElementsByTagName('head')[0].appendChild(metaDescription);
    
    return () => {
        document.getElementsByTagName('head')[0].removeChild(metaDescription);
    };
}, []);
    useEffect(()=>{
        console.log(query);
    },[query])

  const {find} = useParams()
  useEffect(()=>{
    document.title = `CocinApp : Buscando ${find}`
  })

  const search = (e)=>{
    e.preventDefault();
    console.log('BUSCAR:'+ query)
  }


  return (
    <div className='search-cont'>
      <h2 className='search-title' >BUSCAR RECETAS</h2>
      <div className='search-bar'>
        <form onSubmit={search}>
                <div className="search-bar">
                <input className='search-inpt' type="text" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder='Buscar...'/>
                <button className='search-btn' type='submit' >
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="white" d="M6 2h8v2H6zM4 6V4h2v2zm0 8H2V6h2zm2 2H4v-2h2zm8 0v2H6v-2zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2zm0-8h2v8h-2zm0 0V4h-2v2z"/></svg>
                </button>
                </div>
            </form>
      </div>

    </div>
  )
}

export default Buscar

//react itu bungkus html ke dallam javascript
// 1

function Home (){
    return <div>
                <Judul />
                <Isi />
             </div>;    
}

function Judul (){
    return <h1 class="text-3xl font-bold underline">Berita Hari Ini</h1>;
}

function Isi (){
    return <p>Males kelas karna panass</p>;
}
export default Home;
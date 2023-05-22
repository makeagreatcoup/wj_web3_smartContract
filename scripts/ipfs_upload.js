async function run(){
    const {create} =await import('ipfs-http-client');
    const ipfs = await create();

    const metadata={
        path:'/',
        content:JSON.stringify({
            name:"Wu Ji NFT",
            attributes:[
                {
                    "trait_type":"One",
                    "value":10
                },
                {
                    "trait_type":"Two",
                    "value":20
                },
                {
                    "trait_type":"Three",
                    "value":30
                }
            ],
            image:"https://dweb.link/ipfs/QmXRPtPqnyepJ5ttBz1ppVcE5oipU4kyMQuQD4A7HG1kGm",
            description:"makeagreatcoup"
        })
    };
    const result = await ipfs.add(metadata);
    console.log(result)
    process.exit(0);
}

run();
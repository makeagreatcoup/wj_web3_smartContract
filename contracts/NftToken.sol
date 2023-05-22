//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ERC721非同质化代币（NFT）
 * @author wangj
 * @notice 
 */
contract NftToken is ERC721,ERC721URIStorage,Ownable{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("WujiToken","WJT"){}

    function safeMint(address _to,string memory uri)public onlyOwner{
        uint256 tokenId=_tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_to,tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId) internal override(ERC721,ERC721URIStorage){
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)public view override(ERC721,ERC721URIStorage) returns(string memory){
        return super.tokenURI(tokenId);
    }
}
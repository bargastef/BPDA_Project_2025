#![no_std]

extern crate alloc;
use multiversx_sc::imports::*;
use alloc::string::ToString;

#[multiversx_sc::contract]
pub trait NftContract {
    #[init]
    fn init(&self) {}

    #[view(checkNfts)]
    fn check_nfts(
        &self,
        existing_nfts: MultiValueEncoded<ManagedBuffer<Self::Api>>
    ) -> MultiValue3<bool, bool, bool> {
        // Construim un ManagedVec din MultiValueEncoded
        let mut nfts_vec: ManagedVec<Self::Api, ManagedBuffer<Self::Api>> = ManagedVec::new();
        for nft in existing_nfts.into_iter() {
            nfts_vec.push(nft);
        }

        // Adresa caller-ului
        let caller = self.blockchain().get_caller();
        let caller_buf = caller.as_managed_buffer().clone();

        // Exemple de stringuri de comparat
        let piatra = ManagedBuffer::from("PIATRA-").concat(caller_buf.clone());
        let foarfeca = ManagedBuffer::from("FOARFECA-").concat(caller_buf.clone());
        let hartie = ManagedBuffer::from("HARTIE-").concat(caller_buf.clone());

        // Verificăm existența fiecărui tip de NFT folosind ManagedVec
        let has_piatra = nfts_vec.iter().any(|n| *n == piatra);
        let has_foarfeca = nfts_vec.iter().any(|n| *n == foarfeca);
        let has_hartie = nfts_vec.iter().any(|n| *n == hartie);

        MultiValue3((has_piatra, has_foarfeca, has_hartie))
    }
}

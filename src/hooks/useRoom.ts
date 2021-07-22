import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";


type FirebaseQuestions = Record<string, {
    author :{
        name: string;
        avatar: string;
    }
    content : string;
    isAnswered: boolean;
    isHighLighted: boolean;
    likes: Record<string,{
        authorId: string;
    }> 
}>

type QuestionType ={
    id: string;
    author :{
        name: string;
        avatar: string;
    }
    content : string;
    isAnswered: boolean;
    isHighLighted: boolean;
    likeCount: number;
    likeId: string | undefined;
}

export function useRoom(roomId:string){
    const { user }  = useAuth();
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [title, setTitle] = useState('')

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`);

        //Fica ouvindo se terá alguma alteração no campo value do retorno do firebase.
        //Para essa condição pois ele verifica sempre cada alteração no value, pesquisa por child added
        // https://firebase.google.com/docs/database/admin/retrieve-data#child-added
        // de forma que valide somente quando houver uma alteração nas perguntas e não em qualquer value do objeto.
        roomRef.on('value', room =>{
            const databaseRoom = room.val();
            const firebaseQuestions:FirebaseQuestions = databaseRoom.questions ?? {};

            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighLighted: value.isHighLighted,
                    isAnswered: value.isAnswered,
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
                }
            }    
            )

            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
        })

        return () =>{
            roomRef.off('value');
        }
        
    },[roomId, user?.id]);

    return ({questions, title})
}
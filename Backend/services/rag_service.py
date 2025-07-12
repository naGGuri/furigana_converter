# Backend/services/rag_service.py

from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from typing import List, Dict, Any
import chromadb  # chromadb 임포트

# 임베딩 모델 초기화 (한글 및 일본어 지원 모델 사용)
embedding_function = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# ChromaDB 초기화
# 데이터가 저장될 디렉토리를 지정합니다.
CHROMA_DB_PATH = "./chroma_db"

# PersistentClient를 사용하여 로컬 파일 시스템에 저장
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
vector_store = Chroma(client=client, embedding_function=embedding_function)


def add_documents_to_vector_store(texts: List[str], metadatas: List[Dict[str, Any]] = None):
    """
    텍스트 문서를 벡터 저장소에 추가합니다.

    Args:
        texts (List[str]): 벡터 저장소에 추가할 텍스트 문서 리스트.
        metadatas (List[Dict[str, Any]], optional): 각 문서에 대한 메타데이터 리스트. Defaults to None.
    """
    if metadatas is None:
        metadatas = [{} for _ in texts]

    # LangChain의 add_texts 메서드를 사용하여 문서 추가
    vector_store.add_texts(texts=texts, metadatas=metadatas)
    # vector_store.persist() # PersistentClient 사용 시 자동 저장되므로 필요 없음


def retrieve_documents(query: str, user_id: str, k: int = 4) -> List[str]:
    """
    쿼리와 관련된 문서를 벡터 저장소에서 검색합니다.

    Args:
        query (str): 검색 쿼리.
        user_id (str): 문서를 검색할 사용자의 ID.
        k (int, optional): 검색할 문서의 개수. Defaults to 4.

    Returns:
        List[str]: 검색된 문서의 텍스트 내용 리스트.
    """
    print(f"[DEBUG][RAG] Query: {query}, User ID: {user_id}, k: {k}")
    # 사용자 ID 필터링 없이 관련 문서를 검색합니다.
    docs = vector_store.similarity_search(query, k=k)
    print(f"[DEBUG][RAG] Raw retrieved documents ({len(docs)}): {docs}")

    # 검색된 문서들을 Python 코드 내에서 user_id로 필터링합니다.
    # user_id와 doc.metadata.get("user_id")의 타입을 일치시켜 비교합니다.
    filtered_docs = []
    for doc in docs:
        doc_user_id = doc.metadata.get("user_id")
        print(
            f"[DEBUG][RAG] Comparing user_id: {user_id} (type: {type(user_id)}) with doc_user_id: {doc_user_id} (type: {type(doc_user_id)})")
        if str(doc_user_id) == str(user_id):
            filtered_docs.append(doc)
    print(
        f"[DEBUG][RAG] Filtered documents by user_id ({len(filtered_docs)}): {filtered_docs}")

    # k개로 제한하여 반환합니다.
    final_docs = [doc.page_content for doc in filtered_docs[:k]]
    print(
        f"[DEBUG][RAG] Final documents for context ({len(final_docs)}): {final_docs}")
    return final_docs


# 초기화 시점에 ChromaDB가 존재하지 않으면 생성되도록 합니다.
# 이 부분은 애플리케이션 시작 시 한 번만 실행되어야 합니다.
# 실제 운영 환경에서는 데이터베이스 마이그레이션 스크립트 등을 통해 관리하는 것이 좋습니다.
# PersistentClient를 사용하면 디렉토리가 자동으로 생성되므로 별도의 초기화 로직이 필요 없습니다.
print(f"ChromaDB will use persistent storage at {CHROMA_DB_PATH}")

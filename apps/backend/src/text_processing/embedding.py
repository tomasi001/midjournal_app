from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np


class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            # Initialize the model only once
            model_name = "BAAI/bge-small-en-v1.5"
            print(f"Loading embedding model: {model_name}...")
            try:
                cls._model = SentenceTransformer(model_name)
                print("Embedding model loaded successfully.")
            except Exception as e:
                print(f"Failed to load embedding model: {e}")
                cls._model = None
        return cls._instance

    def get_embedding(
        self, text: Union[str, List[str]]
    ) -> Union[List[float], List[List[float]]]:
        """
        Generates an embedding for a single text or a list of texts.
        """
        if not self._model:
            raise RuntimeError("Embedding model is not available.")

        # The model's encode function can handle both a single sentence and a list of sentences.
        embeddings = self._model.encode(text, normalize_embeddings=True)

        # The output of encode can be a single numpy array or a list of numpy arrays.
        # We convert them to a list of floats or a list of lists of floats.
        if isinstance(embeddings, np.ndarray) and embeddings.ndim == 1:
            return embeddings.tolist()
        elif isinstance(embeddings, np.ndarray) and embeddings.ndim > 1:
            return [arr.tolist() for arr in embeddings]
        else:
            return embeddings  # Should already be in a list format

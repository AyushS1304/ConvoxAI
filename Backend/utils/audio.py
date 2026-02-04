from faster_whisper import WhisperModel
import warnings
import os
from config import WHISPER_MODEL_SIZE
import logging

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except (ImportError, ModuleNotFoundError) as e:
    PYDUB_AVAILABLE = False
    logging.warning(f"pydub not available (Python 3.13+ compatibility issue): {e}")

logger = logging.getLogger(__name__)
warnings.filterwarnings("ignore", category=UserWarning)

_MODEL_CACHE = {}

def get_whisper_model(model_size):
    if model_size not in _MODEL_CACHE:
        logger.debug(f"Loading Whisper model: {model_size}")
        _MODEL_CACHE[model_size] = WhisperModel(model_size, device="cpu", compute_type="int8")
        logger.info(f"Whisper model '{model_size}' loaded successfully")
    return _MODEL_CACHE[model_size]

def convert_to_wav(input_file_path, output_file_path):
    if not PYDUB_AVAILABLE:
        raise RuntimeError(
            "Audio conversion requires pydub, which is not available in Python 3.13+. "
            "Please use Python 3.11 or 3.12, or provide audio files in WAV format."
        )
    try:
        audio = AudioSegment.from_file(input_file_path)
        audio.export(output_file_path, format="wav")
    except Exception as e:
        raise RuntimeError(f"Audio conversion failed: {e}")

def transcribe_audio_simple(audio_file_path, model_size=WHISPER_MODEL_SIZE):
    logger.info(f"Starting transcription: file={audio_file_path}, model={model_size}")
    if model_size not in ["tiny", "base", "small", "medium", "large"]:
        logger.error(f"Invalid model size: {model_size}")
        raise ValueError("Invalid model size.")
    if not audio_file_path.lower().endswith(".wav"):
        wav_file_path = audio_file_path.rsplit(".", 1)[0] + ".wav"
        if not os.path.exists(wav_file_path):
            convert_to_wav(audio_file_path, wav_file_path)
        audio_file_path = wav_file_path
    model = get_whisper_model(model_size)
    logger.debug("Running Whisper transcription...")
    segments, info = model.transcribe(audio_file_path)
    text = " ".join([segment.text for segment in segments])
    logger.info(f"Transcription complete: {len(text)} characters, language={info.language}")
    return text


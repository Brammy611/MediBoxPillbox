"""Test Qualcomm AI Hub model access and inference"""
import qai_hub as hub
import numpy as np
from datetime import datetime

print("=" * 60)
print("🧪 QUALCOMM AI HUB MODEL TEST")
print("=" * 60)

# Test 1: Model Access
print("\n✅ Test 1: Model Access")
try:
    model = hub.get_model('mq885klzq')
    print(f"   Model ID: {model.model_id}")
    print(f"   Model Name: {model.name}")
    print(f"   Attributes: {dir(model)[:10]}...")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Test 2: Model Input Requirements
print("\n✅ Test 2: Model Input Specification")
try:
    if hasattr(model, 'input_spec'):
        print(f"   Input Spec: {model.input_spec}")
    elif hasattr(model, 'get_input_spec'):
        spec = model.get_input_spec()
        print(f"   Input Spec: {spec}")
    else:
        print("   ⚠️  Input spec not available via standard attributes")
        print(f"   Available methods: {[m for m in dir(model) if not m.startswith('_')]}")
except Exception as e:
    print(f"   ⚠️  Could not retrieve input spec: {e}")

# Test 3: Simple Inference Test
print("\n✅ Test 3: Inference Test")
try:
    # Create sample input (medication compliance features)
    # Model expects (1, 1) shape - only delay_minutes
    delay_minutes = 5.0  # 5 minutes late
    
    model_input = np.array([[delay_minutes]], dtype=np.float32)  # Shape: (1, 1)
    print(f"   Input shape: {model_input.shape}")
    print(f"   Input values: {model_input}")
    
    # Get device
    print("   🔍 Getting devices...")
    devices = hub.get_devices()
    device = devices[0] if devices else None
    
    if not device:
        print("   ❌ No devices available!")
        exit(1)
    
    print(f"   🎯 Selected device: {device.name}")
    
    # Submit inference job
    print("   🚀 Submitting inference job...")
    job = hub.submit_inference_job(
        model=model,
        device=device,
        inputs={"serving_default_keras_tensor:0": [model_input]}  # Correct input name for Keras model!
    )
    
    print(f"   Job ID: {job.job_id}")
    print("   ⏳ Waiting for results...")
    
    # Get results
    job.wait()  # Wait for job to complete
    result = job.download_output_data()
    print(f"   ✅ Result: {result}")
    print(f"   Result Type: {type(result)}")
    
    # Parse result
    if isinstance(result, dict):
        print(f"   Result keys: {result.keys()}")
        for key, value in result.items():
            print(f"   {key}: {value} (type: {type(value)})")
    
except Exception as e:
    print(f"   ❌ Inference failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("🏁 Test Complete")
print("=" * 60)

require('dotenv').config({ path: './.env.cpanel' });
const emailService = require('./utils/emailService');

async function runAllEmailTests() {
    console.log('\n🎯 SNAPPIFY EMAIL SYSTEM TEST RESULTS');
    console.log('=====================================\n');
    
    const testUser = {
        _id: '64f7e1a2b3c4d5e6f7890123',
        name: 'Motheo Modisaesi',
        email: 'motheomodisaesi@gmail.com',
        resetPasswordToken: 'test-reset-token-123'
    };

    const tests = [
        {
            name: '🎉 Welcome Email',
            test: () => emailService.sendWelcomeEmail(testUser)
        },
        {
            name: '🔐 Password Reset Email',
            test: () => emailService.sendPasswordResetEmail(testUser)
        }
    ];

    let successCount = 0;
    let totalTests = tests.length;

    console.log(`📧 Testing ${totalTests} email types...\n`);

    for (const testCase of tests) {
        try {
            console.log(`📤 Testing: ${testCase.name}`);
            const result = await testCase.test();
            console.log(`✅ SUCCESS: ${testCase.name} sent!`);
            console.log(`   Message sent successfully!\n`);
            successCount++;
        } catch (error) {
            console.log(`❌ FAILED: ${testCase.name}`);
            console.log(`   Error: ${error.message}\n`);
        }
        
        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('📊 TEST SUMMARY');
    console.log('================');
    console.log(`✅ Successful: ${successCount}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
    
    if (successCount === totalTests) {
        console.log('\n🎉 ALL EMAIL TESTS PASSED!');
        console.log('Your email system is fully functional and ready for production!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
    
    console.log('\n📬 Check your inbox:', testUser.email);
    console.log('💡 Don\'t forget to check your spam/junk folder too!');
}

runAllEmailTests().catch(console.error);
